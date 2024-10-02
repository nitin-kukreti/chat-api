import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { ChatRoom } from './chat/entities/chat-room.entity';
import { ChatMessage } from './chat/entities/chat.entity';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from './user/entities/user.entities';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService,
      ): Promise<TypeOrmModuleOptions> => {
        // Specify return type here
        const dbConfig: TypeOrmModuleOptions = {
          type: 'postgres',
          host: configService.get('config.database.host'),
          port: +configService.get('config.database.port'),
          username: configService.get('config.database.username'),
          password: configService.get('config.database.password'),
          database: configService.get('config.database.name'),
          entities: [User, ChatRoom, ChatMessage],
          synchronize: true, // Use with caution in production
        };

        console.log('TypeORM setup:', dbConfig); // Log the database configuration for debugging
        return dbConfig;
      },
      inject: [ConfigService],
    }),
    NotificationModule,
    AuthModule,
    ChatModule,
    UserModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
