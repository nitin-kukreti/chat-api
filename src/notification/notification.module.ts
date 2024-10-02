// src/notification/notification.module.ts
import { Global, Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { NotificationService } from './notification.service';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: (configService: ConfigService) => {
        const serviceAccount = configService.get(
          'config.firebase.serviceAccount',
        );
        return admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      },
      inject: [ConfigService],
    },
    NotificationService,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
