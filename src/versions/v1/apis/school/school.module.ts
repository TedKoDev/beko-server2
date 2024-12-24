import { PrismaService } from '@/prisma';
import { Module } from '@nestjs/common';
import { CommentsModule } from '../comments/comments.module';
import { SchoolController } from './school.controller';
import { SchoolService } from './school.service';

@Module({
  imports: [CommentsModule],
  providers: [SchoolService, PrismaService],
  controllers: [SchoolController],
  exports: [SchoolService],
})
export class SchoolModule {}
