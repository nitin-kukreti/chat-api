import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PaginatedResponseDto<T> {
  @ApiProperty({ type: [Object] })
  items: T[];

  @ApiProperty()
  @Expose()
  total: number;

  @ApiProperty()
  @Expose()
  page: number;

  @ApiProperty()
  @Expose()
  limit: number;
}
