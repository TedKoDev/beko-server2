import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EmailService } from './email.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('SMTP_USER_HOST'),
          port: configService.get('SMTP_USER_PORT'),
          secure: true,
          auth: {
            user: configService.get('SMTP_USER_ID'),
            pass: configService.get('SMTP_USER_PASSWORD'),
          },
        },
        defaults: {
          from: `"BeraKorean" <${configService.get('SMTP_FROM')}>`,
        },
        template: {
          dir: join(__dirname, '../../../../views/'),
          adapter: new EjsAdapter(),
          options: {
            strict: false,
          },
        },
      }),
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
