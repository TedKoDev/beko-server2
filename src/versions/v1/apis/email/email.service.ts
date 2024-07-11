import { Injectable } from '@nestjs/common';
import * as config from 'config';
import * as nodemailer from 'nodemailer';
import { CreateEmailDto } from './email.dto';

@Injectable()
export class EmailsService {
  async sendEmail(createEmailDto: CreateEmailDto): Promise<void> {
    console.log(config.get('email.user'), config.get('email.pass'));
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: config.get('email.user'),
        pass: config.get('email.pass'),
      },
    });

    const mailOptions = {
      from: config.get('email.user'),
      to: createEmailDto.receiverEmail,
      subject: createEmailDto.subject,
      text: createEmailDto.content,
    };

    await transporter.sendMail(mailOptions);
  }
}
