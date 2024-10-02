import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  ParseIntPipe,
  UseGuards,
  Request,
  Query,
  Req,
  Delete,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatMessage } from './entities/chat.entity';
import { ApiTags, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { CreateChatRoomDto } from './dto/ChatRoom.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ChatRoom } from './entities/chat-room.entity';
import { PaginatedResponseDto } from 'src/common/dto/paginatedResponse.dto';
import { SearchRoomDto } from './dto/search-room.dto';

@ApiTags('chat')
@ApiSecurity('bearer')
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  // Create Chat Room
  @Post('rooms')
  @ApiResponse({
    status: 201,
    description: 'Chat room created successfully.',
    type: ChatRoom,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async createRoom(
    @Body() createChatRoomDto: CreateChatRoomDto,
    @Req() request,
  ): Promise<ChatRoom> {
    return await this.chatService.createChatRoom(
      createChatRoomDto,
      request.user.userId,
    );
  }

  // Get Chat Room Messages (Paginated)
  @Get('rooms/:roomId/messages')
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully.',
    type: PaginatedResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Chat room not found.' })
  async getMessagesByRoomId(
    @Param('roomId', new ParseIntPipe()) roomId: number,
    @Query() { limit, page }: PaginationDto,
  ): Promise<PaginatedResponseDto<ChatMessage>> {
    const { messages, total } = await this.chatService.getMessagesByRoomId(
      roomId,
      page,
      limit,
    );
    return { items: messages, total, limit, page };
  }

  // Get One-on-One Messages with a User (Paginated)
  @Get('users/:targetUserId/messages')
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully.',
    type: PaginatedResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getMessagesWithUser(
    @Param('targetUserId', new ParseIntPipe()) targetUserId: number,
    @Request() req,
    @Query() { limit, page }: PaginationDto,
  ): Promise<PaginatedResponseDto<ChatMessage>> {
    const loggedInUserId: number = req.user.userId;
    const { messages, total } = await this.chatService.getMessagesBetweenUsers(
      loggedInUserId,
      targetUserId,
      page,
      limit,
    );
    return { items: messages, total, limit, page };
  }

  // Get All Chat Rooms of the Current User (Paginated)

  @Get('rooms')
  @ApiResponse({
    status: 200,
    description: 'Chat rooms retrieved successfully.',
    type: PaginatedResponseDto,
  })
  async getChatRooms(
    @Request() req,
    @Query() search: SearchRoomDto,
  ): Promise<PaginatedResponseDto<ChatRoom>> {
    const { rooms, total } = await this.chatService.listRooms(search);
    return {
      items: rooms,
      total: total,
      limit: search.limit,
      page: search.page,
    };
  }
  @Get('joined-rooms')
  @ApiResponse({
    status: 200,
    description: 'Chat rooms retrieved successfully.',
    type: PaginatedResponseDto,
  })
  async getUserJoinedChatRooms(
    @Request() req,
    @Query() { limit, page }: PaginationDto,
  ): Promise<PaginatedResponseDto<ChatRoom>> {
    const { rooms, total } = await this.chatService.getRoomsForUser(
      req.user.userId,
      page,
      limit,
    );
    return { items: rooms, total: total, limit, page };
  }

  // Join Chat Room
  @Post('rooms/:roomId/join')
  @ApiResponse({
    status: 200,
    description: 'Successfully joined the chat room.',
    type: ChatRoom,
  })
  @ApiResponse({ status: 404, description: 'Chat room not found.' })
  async joinRoom(
    @Param('roomId', new ParseIntPipe()) roomId: number,
    @Request() req,
  ): Promise<ChatRoom> {
    return this.chatService.joinRoom(req.user.userId, roomId);
  }

  // Leave Chat Room
  @Post('rooms/:roomId/leave')
  @ApiResponse({ status: 200, description: 'Successfully left the chat room.' })
  @ApiResponse({ status: 404, description: 'Chat room not found.' })
  async leaveRoom(
    @Param('roomId', new ParseIntPipe()) roomId: number,
    @Request() req,
  ): Promise<void> {
    await this.chatService.leaveRoom(req.user.userId, roomId);
  }

  // Delete Chat Room (Only Owner can delete)
  @Delete('rooms/:roomId')
  @ApiResponse({ status: 200, description: 'Chat room deleted successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Only the owner can delete this room.',
  })
  @ApiResponse({ status: 404, description: 'Chat room not found.' })
  async deleteRoom(
    @Param('roomId', new ParseIntPipe()) roomId: number,
    @Request() req,
  ): Promise<void> {
    return this.chatService.deleteRoom(roomId, req.user.userId);
  }
}
