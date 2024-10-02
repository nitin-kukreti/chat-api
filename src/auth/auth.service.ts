import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entities';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  login(user: User) {
    const token = this.generateJwtToken(user);
    return { token };
  }

  generateJwtToken(user: User, secret?: string): string {
    const payload = { username: user.username, sub: user.id };
    if (secret) {
      return this.jwtService.sign(payload, {
        secret: secret,
      });
    }
    return this.jwtService.sign(payload);
  }
}
