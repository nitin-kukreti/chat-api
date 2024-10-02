import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { LocalStrategy } from './local.stategy';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UserModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const jwtConfig = {
          secret: configService.get<string>('config.jwt.secret'), // Fetch secret from the config
          signOptions: {
            expiresIn: configService.get<string>('config.jwt.expiration'),
          },
        };

        console.log('JWT Configuration:', jwtConfig);

        return jwtConfig;
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule], // Export AuthService and JwtModule for use in other modules
})
export class AuthModule {}
