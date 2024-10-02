// src/notification/notification.service.ts
import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';

@Injectable()
export class NotificationService {
  constructor(@Inject('FIREBASE_ADMIN') private readonly admin: any) {}

  async sendNotification(
    tokens: string[],
    title: string,
    body: string,
  ): Promise<void> {
    const message = {
      notification: {
        title,
        body,
      },
      tokens,
    };

    try {
      const response = await this.admin.messaging().sendMulticast(message);
      console.log('Successfully sent message:', response);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
}
