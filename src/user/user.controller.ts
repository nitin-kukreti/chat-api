// src/user/user.controller.ts

import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { AddDeviceTokenDto } from './dto/add-device-token.dto';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterUserDto } from './dto/register-user.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  async register(@Body() body: RegisterUserDto) {
    const { username, password } = body;
    const newUser = await this.userService.createUser(username, password);
    return { message: 'User successfully registered', userId: newUser.id };
  }

  @UseGuards(JwtAuthGuard) // Protect the route with JWT authentication
  @Post('add-device-token')
  @ApiOperation({
    summary: 'Add or update FCM device token for the authenticated user',
  })
  @ApiResponse({
    status: 204,
    description: 'Device token updated successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async addDeviceToken(
    @Request() req, // Get the request object to access user info
    @Body() addDeviceTokenDto: AddDeviceTokenDto,
  ): Promise<void> {
    const userId: number = req.user.userId; // Extract userId from the JWT token
    const { deviceToken } = addDeviceTokenDto; // Get device token from request body
    await this.userService.saveDeviceToken(userId, deviceToken); // Save token for the authenticated user
  }
}
