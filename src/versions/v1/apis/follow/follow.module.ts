import { PrismaService } from '@/prisma/postsql-prisma.service';
import { Module } from '@nestjs/common';
import { FollowController } from './follow.controller';
import { FollowService } from './follow.service';

@Module({
  providers: [FollowService, PrismaService],
  controllers: [FollowController],
})
export class FollowModule {}
