import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsString, IsDate, IsNotEmpty } from 'class-validator';
import { PaginatedResponseDto } from 'src/common/dto/paginatedResponse.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class ResponseUserDto {
  @ApiProperty({ example: 1 }) // Example user ID
  @Expose()
  id: number;

  @ApiProperty({ example: 'nitin' }) // Example username
  @Expose()
  @IsString()
  @IsNotEmpty() // Ensures username is not empty
  username: string;

  @Exclude() // Exclude the password field
  password: string; // This field will not be included in the response

  @ApiProperty({ example: new Date().toISOString() }) // Example date
  @Expose()
  @IsDate()
  createdAt: Date;

  @ApiProperty({ example: new Date().toISOString() }) // Example date
  @Expose()
  @IsDate()
  updatedAt: Date;
}

export class ResponseChatMessageDto {
  @ApiProperty({ example: 8 }) // Example message ID
  @Expose()
  id: number;

  @ApiProperty({ example: 'Hello from Postman!' }) // Example message content
  @Expose()
  @IsString()
  content: string;

  @ApiProperty({ example: new Date().toISOString() }) // Example creation date
  @Expose()
  @IsDate()
  createdAt: Date;

  @ApiProperty({ example: new Date().toISOString() }) // Example update date
  @Expose()
  @IsDate()
  updatedAt: Date;

  @ApiProperty({ type: ResponseUserDto }) // Reference to the user DTO
  @Expose()
  @Type(() => ResponseUserDto)
  user: ResponseUserDto;
}

export class ResponseMessageDto extends PaginatedResponseDto<ResponseChatMessageDto> {
  @ApiProperty({
    type: [ResponseChatMessageDto],
  })
  @Type(() => ResponseChatMessageDto)
  items: ResponseChatMessageDto[];
}

export class ResponseChatRoomDto {
  @ApiProperty({ example: 6 }) // Example room ID
  @Expose()
  id: number;

  @ApiProperty({ example: 'myroom' }) // Example room name
  @Expose()
  name: string;

  @ApiProperty({ example: true }) // Example isGroup value
  @Expose()
  isGroup: boolean;

  @ApiProperty({ example: new Date().toISOString() }) // Example creation date
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: new Date().toISOString() }) // Example update date
  @Expose()
  updatedAt: Date;
}

export class ResponseChatRoomsDto extends PaginatedResponseDto<ResponseChatRoomDto> {
  @ApiProperty({
    type: [ResponseChatRoomDto],
  })
  @Expose()
  items: ResponseChatRoomDto[];
}
