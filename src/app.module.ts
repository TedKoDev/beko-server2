import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import * as config from 'config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggingInterceptor } from './interceptor';
import { V1Module } from './versions/v1';
import { NotificationModule } from './versions/v1/apis/notification/notification.module';

@Module({
  imports: [
    V1Module,
    JwtModule.register({ global: true, secret: config.get('jwt.secret') }),
    ScheduleModule.forRoot(),
    NotificationModule,
    ConfigModule.forRoot({
      isGlobal: true, // 전역으로 설정
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
