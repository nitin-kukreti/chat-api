import { Exclude, Expose, Type } from 'class-transformer';
import { IsString, IsDate, IsNotEmpty } from 'class-validator';
import { PaginatedResponseDto } from 'src/common/dto/paginatedResponse.dto';

export class ResponseUserDto {
  @Expose()
  id: number;

  @Expose()
  @IsString()
  @IsNotEmpty() // Ensures username is not empty
  username: string;

  @Exclude()
  password: string; // This field will not be included in the response

  @Expose()
  @IsDate()
  createdAt: Date;

  @Expose()
  @IsDate()
  updatedAt: Date;
}

export class ResponseChatMessageDto {
  @Expose()
  id: number;

  @Expose()
  @IsString()
  content: string;

  @Expose()
  @IsDate()
  createdAt: Date;

  @Expose()
  @IsDate()
  updatedAt: Date;

  @Expose()
  @Type(() => ResponseUserDto)
  user: ResponseUserDto;
}

export class ResponseMessageDto extends PaginatedResponseDto<ResponseChatMessageDto> {
  @Expose()
  @Type(() => ResponseChatMessageDto)
  items: ResponseChatMessageDto[];
}
