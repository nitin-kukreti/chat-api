// src/chat/dto/search-room.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class SearchRoomDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;
}
