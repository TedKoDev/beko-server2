import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

import { CreateEmailDto } from './email.dto';

export const EMAIL_SERVICE_TOKEN = 'EMAIL_SERVICE_TOKEN';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendUserConfirmation(email: string, token: string) {
    const url = `http://api.berakorean.com/api/v1/auth/confirm?token=${token}`;
    // const url = `http://localhost:3000/api/v1/auth/confirm?token=${token}`;
    console.log(email, url);
    return this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Our App! Confirm your Email',
      template: 'confirmation', // 이메일 템플릿 (HTML 파일)
      context: {
        url, // 템플릿에서 사용할 URL
      },
    });
  }

  async sendEmail(createEmailDto: CreateEmailDto) {
    this.mailerService.sendMail({
      to: createEmailDto.receiverEmail,
      subject: createEmailDto.subject,
      text: createEmailDto.content,
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const url = `http://api.berakorean.com/reset-password?token=${token}`;
    // const url = `http://localhost:3000/reset-password?token=${token}`;

    return this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request - Bera Korean',
      template: 'reset-password',
      context: {
        url,
      },
    });
  }

  async sendTemporaryPassword(email: string, temporaryPassword: string) {
    return this.mailerService.sendMail({
      to: email,
      subject: 'Your Temporary Password - Bera Korean',
      template: 'temporary-password',
      context: {
        temporaryPassword,
      },
    });
  }
}
