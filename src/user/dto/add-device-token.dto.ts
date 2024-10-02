import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AddDeviceTokenDto {
  @ApiProperty({ description: 'The FCM device token' })
  @IsString()
  @IsNotEmpty()
  deviceToken: string;
}
