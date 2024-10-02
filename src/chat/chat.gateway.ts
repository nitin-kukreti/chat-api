/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/ChatMessage.dto';
import { RoomMessageDto } from './dto/RoomMessage.dto';
import { ChatMessage } from './entities/chat.entity';
import { UserService } from 'src/user/user.service';
import { NotificationService } from 'src/notification/notification.service';
@WebSocketGateway({ path: '/ws/chat', cors: true, transports: ['websocket'] })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server;
  private userSocketMap = new Map<number, WebSocket>();

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
    private userService: UserService,
    private notificationService: NotificationService,
  ) {}

  afterInit(server: any) {
    console.log('WebSocket initialized');
  }

  handleConnection(client: WebSocket, req: IncomingMessage) {
    const token = this.extractTokenFromQuery(req);
    console.log('extracted token', token);
    if (token) {
      try {
        const payload = this.jwtService.verify(token);
        console.log('verified token', payload);
        const user = { id: payload.sub, username: payload.username };
        client['user'] = user;
        const prevSocket = this.userSocketMap.get(user.id);

        if (prevSocket) prevSocket.close();

        this.userSocketMap.set(user.id, client);
        client.send('you are connected');
        console.log(`User ${user.id} connected`);
      } catch (e) {
        console.error('Invalid JWT token:', e);
        client.close();
      }
    } else {
      client.close();
    }
  }
  private extractTokenFromQuery(req: IncomingMessage): string | null {
    const url = new URL(req.url, `http://${req.headers.host}`);
    return url.searchParams.get('token');
  }

  handleDisconnect(client: WebSocket) {
    const userId = client['user']?.id;
    console.log('user disconect ', userId);
    if (userId) {
      this.userSocketMap.delete(userId); // Remove user from map on disconnect
      console.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('user/message')
  async handleOneToOneMessage(
    client: WebSocket,
    payload: ChatMessageDto,
  ): Promise<void> {
    try {
      const senderId = client['user'].id;
      const senderName = client['user'].username;
      if (!senderId) {
        console.error('Unauthorized client');
        return;
      }

      const { content, userId } = payload;
      const receiverId = userId;

      // Save the one-to-one message to the database
      const savedMessage = await this.chatService.sendMessageToUser(
        senderId,
        receiverId,
        content,
      );

      if (!this.sendMessageToUser(senderId, savedMessage, receiverId)) {
        const receiver = await this.userService.getUserById(receiverId);
        if (receiver.deviceToken) {
          await this.notificationService.sendNotification(
            [receiver.deviceToken],
            `Received Message from ${receiver.username}`,
            JSON.stringify(savedMessage),
          );
        }
      }
    } catch (error) {
      console.error('error', error.message);
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('room/message')
  async handleRoomMessage(
    client: WebSocket,
    payload: RoomMessageDto,
  ): Promise<void> {
    try {
      const senderId = client['user'].id;
      const senderName = client['user'].username;

      if (!senderId) {
        console.error('Unauthorized client');
        return;
      }

      const { roomId } = payload;
      const room = await this.chatService.getRoomById(roomId);

      if (!room) throw new WsException('Invalid RoomId');

      // Save the one-to-one message to the database
      const savedMessage = await this.chatService.createMessage(
        payload,
        roomId,
        senderId,
      );

      console.log({ savedMessage });

      const participants =
        await this.chatService.getParticipantsByRoomId(roomId);

      console.log({ participants });

      const participantIds = participants.map((participant) => participant.id);
      console.log({ participantIds });

      const notificationCandidate = new Set<number>();
      participantIds.map((participantId) => {
        if (
          !this.sendMessageToUser(senderId, savedMessage, participantId, roomId)
        ) {
          notificationCandidate.add(participantId);
        }
      });
      const tokens = participants.map((participant) => {
        return (
          notificationCandidate.has(participant.id) && participant.deviceToken
        );
      });
      await this.notificationService.sendNotification(
        tokens,
        `message from ${senderName} in room ${room.name}`,
        JSON.stringify(savedMessage),
      );
    } catch (error) {
      console.error('error', error.message);
      throw new WsException(error.message);
    }
  }

  private sendMessageToUser(
    senderId: number,
    savedMessage: ChatMessage,
    receiverId: number,
    room?: number,
  ) {
    const recipientSocket = this.userSocketMap.get(receiverId);
    if (recipientSocket) {
      recipientSocket.send(
        JSON.stringify({
          event: 'message',
          data: {
            from: senderId,
            message: savedMessage.content,
            createdAt: savedMessage.createdAt,
            room,
          },
        }),
      );
      return true;
    } else {
      console.log(`User ${receiverId} is not connected`);
      return false;
    }
  }
}
