// src/chat/dto/create-chat-room.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateChatRoomDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ isArray: true, type: Number })
  @IsArray()
  @IsOptional() // This is optional for group chats
  participants: number[]; // Array of user IDs for participants
}
