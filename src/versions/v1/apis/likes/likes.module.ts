import { PrismaService } from '@/prisma/postsql-prisma.service';
import { Module } from '@nestjs/common';
import { NotificationModule } from '../notification/notification.module';
import { NotificationService } from '../notification/notification.service';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';

@Module({
  controllers: [LikesController],
  providers: [LikesService, NotificationService, PrismaService],
  exports: [LikesService],
  imports: [NotificationModule],
})
export class LikesModule {}
