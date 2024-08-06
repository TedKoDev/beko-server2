// src/points/points.module.ts
import { PrismaService } from '@/prisma/postsql-prisma.service';
import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth';
import { PointsController } from './points.controller';
import { PointsService } from './points.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [PointsController],
  exports: [PointsService],
  providers: [PointsService, PrismaService],
})
export class PointsModule {}
