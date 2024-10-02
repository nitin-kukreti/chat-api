import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
