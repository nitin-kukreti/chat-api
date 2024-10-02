import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local.auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto'; // Import your Login DTO

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login user and return JWT token' })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in.',
    type: String,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid credentials.',
  })
  async login(
    @Body() _loginDto: LoginDto,
    @Request() req,
  ): Promise<{ token: string }> {
    return this.authService.login(req.user);
  }
}
