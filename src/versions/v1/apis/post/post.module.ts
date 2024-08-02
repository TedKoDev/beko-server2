import { PrismaService } from '@/prisma';
import { Module } from '@nestjs/common';

import { PostController } from './post.controller';
import { PostProvider } from './post.provider';

@Module({
  controllers: [PostController],
  providers: [PrismaService, PostProvider],
  exports: [PostProvider],
})
export class PostModule {}
