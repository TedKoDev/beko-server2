import { Auth } from '@/decorators';
import { Body, Controller, Post, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
@Controller({
  path: 'notifications',
  version: '1',
})
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @Auth(['ANY'])
  @Post('register-token')
  async registerToken(
    @Body() body: { token: string },
    @Req() req: { user: { userId: number } },
  ) {
    const userId = req.user.userId;

    console.log('userIduserIduserIduserIduserIduserId', userId);
    return this.notificationService.saveExpoPushToken(userId, body.token);
  }
}
