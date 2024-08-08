// src/points/points.module.ts
import { PrismaService } from '@/prisma';
import { Module } from '@nestjs/common';
import { PointsController } from './points.controller';
import { PointsService } from './points.service';

@Module({
  controllers: [PointsController],
  providers: [PointsService, PrismaService],
  exports: [PointsService],
})
export class PointsModule {}
