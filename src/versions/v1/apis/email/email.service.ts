import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { CreateEmailDto } from './email.dto';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendUserConfirmation(email: string, token: string) {
    const url = `http://localhost:3000/auth/confirm?token=${token}`;
    console.log(email, url);
    return this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Our App! Confirm your Email',
      template: 'confirmation',
      // context: {
      //   name: 'dmail',
      //   url,
      // },
    });
  }

  async sendEmail(createEmailDto: CreateEmailDto) {
    this.mailerService.sendMail({
      to: createEmailDto.receiverEmail,
      subject: createEmailDto.subject,
      text: createEmailDto.content,
    });
  }
}
