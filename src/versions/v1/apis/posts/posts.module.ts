// src/posts/posts.module.ts
import { Module } from '@nestjs/common';
import { MediaService } from '../media/media.service';

import { PrismaService } from '@/prisma';
import { PointsService } from '../point';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  providers: [PostsService, MediaService, PrismaService, PointsService],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}
