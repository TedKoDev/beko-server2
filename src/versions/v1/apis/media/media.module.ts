// src/media/media.module.ts
import { PrismaService } from '@/prisma/postsql-prisma.service';
import { Module } from '@nestjs/common';
import { MediaService } from './media.service';

@Module({
  providers: [MediaService, PrismaService],
  exports: [MediaService],
})
export class MediaModule {}
