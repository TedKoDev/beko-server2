// src/comments/comments.module.ts
import { PrismaService } from '@/prisma/postsql-prisma.service';
import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { NotificationModule } from '../notification/notification.module';
import { PointsModule } from '../point';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  imports: [MediaModule, PointsModule, NotificationModule],
  controllers: [CommentsController],
  providers: [CommentsService, PrismaService],
})
export class CommentsModule {}
