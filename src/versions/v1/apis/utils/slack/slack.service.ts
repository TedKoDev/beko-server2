// slack.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebClient } from '@slack/web-api';

@Injectable()
export class SlackService {
  private slackClient: WebClient;
  private readonly channelId: string;

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>('SLACK_API_TOKEN');
    this.channelId = this.configService.get<string>('SLACK_CHANNEL_ID');

    if (!token || !this.channelId) {
      console.error('Slack configuration missing');
      return;
    }

    this.slackClient = new WebClient(token);
    this.validateChannel().catch(console.error);
  }

  private async validateChannel() {
    if (!this.slackClient || !this.channelId) return;

    try {
      const result = await this.slackClient.conversations.info({
        channel: this.channelId,
      });
      console.log('Slack channel validated:', result.channel?.name);

      const members = await this.slackClient.conversations.members({
        channel: this.channelId,
      });
      console.log('Channel members:', members);
      console.log('Bot token:', this.slackClient.token);
    } catch (error) {
      console.error('Invalid Slack channel:', error.data || error);
    }
  }

  async sendMessage(message: string, channelId?: string) {
    if (!this.slackClient || !this.channelId) {
      console.error('Slack client not properly initialized');
      return;
    }

    try {
      const response = await this.slackClient.chat.postMessage({
        channel: channelId || this.channelId,
        text: message,
      });
      console.log('Message sent successfully:', response.ts);
      return response;
    } catch (error) {
      console.error('Slack message sending failed:', {
        error: error.message,
        data: error.data,
        scopes: error.data?.response_metadata?.scopes,
      });
      // 에러를 throw하지 않고 조용히 실패
    }
  }

  async sendNewUserNotification(
    email: string,
    username: string,
  ): Promise<void> {
    try {
      await this.sendMessage(
        `🎉 *새로운 회원이 가입했습니다!*\n>Email: ${email}\n>Username: ${username}`,
      );
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }
}
