// src/points/points.module.ts
import { PrismaService } from '@/prisma';
import { Module } from '@nestjs/common';
import { PointsService } from './points.service';

@Module({
  providers: [PointsService, PrismaService],
  exports: [PointsService],
})
export class PointsModule {}
