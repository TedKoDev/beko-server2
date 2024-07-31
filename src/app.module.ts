import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggingInterceptor } from './interceptor';
import { MongoPrismaService } from './prisma';
import { V1Module } from './versions/v1';
import { JwtAuthGuard, RolesGuard } from './versions/v1/apis/auth';

@Module({
  imports: [V1Module],
  controllers: [AppController],
  providers: [
    AppService,
    MongoPrismaService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
