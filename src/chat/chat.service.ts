import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { Repository } from 'typeorm';
import { ChatMessage } from './entities/chat.entity';
import { CreateChatRoomDto } from './dto/ChatRoom.dto';
import { User } from 'src/user/entities/user.entities';
import { SearchRoomDto } from './dto/search-room.dto';
import { UserService } from 'src/user/user.service';
import { RoomMessageDto } from './dto/RoomMessage.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom)
    private chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    private userService: UserService,
  ) {}

  async listRooms(
    searchDto: SearchRoomDto,
  ): Promise<{ rooms: ChatRoom[]; total: number }> {
    const { name, page, limit } = searchDto;

    const queryBuilder = this.chatRoomRepository.createQueryBuilder('room');

    if (name) {
      queryBuilder.where('room.name LIKE :name', { name: `%${name}%` });
    }

    // Get the total count for pagination
    const total = await queryBuilder.getCount();

    queryBuilder.skip((page - 1) * limit).take(limit);

    const rooms = await queryBuilder.getMany();

    return { rooms, total };
  }

  async getRoomsForUser(
    userId: number,
    page: number,
    limit: number,
  ): Promise<{ rooms: ChatRoom[]; total: number }> {
    const [rooms, total] = await this.chatRoomRepository
      .createQueryBuilder('room')
      .innerJoin('room.participants', 'participant')
      .where('participant.id = :userId', { userId: userId })
      .skip((page - 1) * limit) // Pagination logic
      .take(limit) // Limit the results
      .getManyAndCount(); // Get both results and count

    return { rooms, total }; // Return rooms and total count
  }

  async deleteRoom(roomId: number, userId: number): Promise<void> {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId },
      relations: ['owner'],
    });

    if (!room) {
      throw new NotFoundException('Chat room not found');
    }

    // Check if the user is the owner (you can add an owner field in the ChatRoom entity)
    if (room.owner.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this room',
      );
    }

    await this.chatRoomRepository.remove(room);
  }

  async createChatRoom(
    createChatRoomDto: CreateChatRoomDto,
    ownerId: number,
  ): Promise<ChatRoom> {
    // Create a new instance of ChatRoom with the provided DTO and owner information
    const chatRoom = this.chatRoomRepository.create({
      ...createChatRoomDto,
      isGroup: true,
      participants: [{ id: ownerId }], // Assign the owner as a participant
      owner: { id: ownerId }, // Set the owner
    });

    // Save the chat room to the database
    return await this.chatRoomRepository.save(chatRoom);
  }

  async joinRoom(userId: number, roomId: number): Promise<ChatRoom> {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId },
      relations: ['participants'],
    });

    if (!room) {
      throw new NotFoundException(`Chat room with ID ${roomId} not found.`);
    }

    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    if (!room.participants.some((participant) => participant.id === userId)) {
      room.participants.push(user);
      await this.chatRoomRepository.save(room);
    }

    return room;
  }

  async leaveRoom(userId: number, roomId: number): Promise<ChatRoom> {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId },
      relations: ['participants'],
    });

    if (!room) {
      throw new NotFoundException(`Chat room with ID ${roomId} not found.`);
    }

    room.participants = room.participants.filter(
      (participant) => participant.id !== userId,
    );
    await this.chatRoomRepository.save(room);

    return room;
  }

  async createMessage(
    createMessageDto: RoomMessageDto,
    roomId: number,
    user: User,
  ): Promise<ChatMessage> {
    const chatRoom = await this.chatRoomRepository.findOne({
      where: { id: roomId },
    });
    if (!chatRoom) {
      throw new NotFoundException('Chat room not found');
    }

    const message = this.chatMessageRepository.create({
      ...createMessageDto,
      chatRoom,
      user, // Associate the message with the user who sent it
    });

    return this.chatMessageRepository.save(message);
  }

  async getMessagesByRoomId(roomId: number, page: number, limit: number) {
    const [messages, total] = await this.chatMessageRepository.findAndCount({
      where: { chatRoom: { id: roomId } },
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return { messages, total }; // You can also return total for pagination metadata
  }

  async getOrCreateChatRoom(
    userId1: number,
    userId2: number,
  ): Promise<ChatRoom> {
    const existingRoom = await this.chatRoomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.participants', 'user')
      .where('room.isGroup = :isGroup', { isGroup: false })
      .andWhere('user.id IN (:...userIds)', { userIds: [userId1, userId2] })
      .getOne();

    if (existingRoom) {
      return existingRoom;
    }

    // Create a new chat room if it doesn't exist
    const newRoom = this.chatRoomRepository.create({
      name: `Chat between ${userId1} and ${userId2}`,
      isGroup: false,
      participants: [{ id: userId1 }, { id: userId2 }], // assuming User entity has an id property
    });

    return await this.chatRoomRepository.save(newRoom);
  }

  async sendMessageToUser(
    senderId: number,
    receiverId: number,
    content: string,
  ): Promise<ChatMessage> {
    const receiver = await this.userService.getUserById(receiverId);

    if (!receiver) throw new NotFoundException('receiver not found');

    const chatRoom = await this.getOrCreateChatRoom(senderId, receiverId);

    const newMessage = this.chatMessageRepository.create({
      content,
      chatRoom,
      user: { id: senderId },
    });

    return await this.chatMessageRepository.save(newMessage);
  }

  async getMessagesBetweenUsers(
    userId1: number,
    userId2: number,
    page: number,
    limit: number,
  ) {
    const chatRoom = await this.getOrCreateChatRoom(userId1, userId2);

    const [messages, total] = await this.chatMessageRepository.findAndCount({
      where: { chatRoom: { id: chatRoom.id } },
      relations: ['user'], // Include the user who sent the message
      skip: (page - 1) * limit,
      take: limit,
    });

    return { messages, total };
  }

  async getParticipantsByRoomId(roomId: number): Promise<User[]> {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId },
      relations: ['participants'],
    });
    return room?.participants;
  }

  async getRoomById(roomId: number): Promise<ChatRoom> {
    return await this.chatRoomRepository.findOneBy({ id: roomId });
  }
}
