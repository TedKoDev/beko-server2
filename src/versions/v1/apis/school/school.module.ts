import { Module } from '@nestjs/common';
import { SchoolController } from './school.controller';
import { SchoolService } from './school.service';

import { PrismaService } from '@/prisma';

@Module({
  providers: [SchoolService, PrismaService],
  controllers: [SchoolController],
  exports: [SchoolService],
})
export class SchoolModule {}
