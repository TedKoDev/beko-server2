import { Module } from '@nestjs/common';
import { SchoolController } from './school.controller';
import { SchoolService } from './school.service';

import { PrismaService } from '@/prisma';

@Module({
  controllers: [SchoolController],
  providers: [SchoolService, PrismaService],
  exports: [SchoolService],
})
export class SchoolModule {}
