import { PrismaService } from '@/prisma/postsql-prisma.service';
import { Injectable } from '@nestjs/common';
import { Expo } from 'expo-server-sdk';

@Injectable()
export class NotificationService {
  private expo = new Expo();

  constructor(private readonly prisma: PrismaService) {}

  async saveExpoPushToken(userId: number, token: string) {
    return this.prisma.users.update({
      where: { user_id: userId },
      data: { expo_push_token: token },
    });
  }

  async sendPushNotification(expoPushToken: string, message: string) {
    const messages = [];
    if (!Expo.isExpoPushToken(expoPushToken)) {
      console.error(`Invalid Expo push token: ${expoPushToken}`);
      return;
    }

    messages.push({
      to: expoPushToken,
      sound: 'default',
      body: message,
      data: { message },
    });

    const chunks = this.expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        const receipts = await this.expo.sendPushNotificationsAsync(chunk);
        console.log(receipts);
      } catch (error) {
        console.error(error);
      }
    }
  }
}
