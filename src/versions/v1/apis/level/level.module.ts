import { PrismaService } from '@/prisma';
import { Module } from '@nestjs/common';
import { PointsModule } from '../point/points.module';
import { LevelThresholdController } from './level.controller';
import { LevelThresholdService } from './level.service';

@Module({
  imports: [PointsModule],
  controllers: [LevelThresholdController],
  providers: [LevelThresholdService, PointsModule, PrismaService],
  exports: [LevelThresholdService],
})
export class LevelThresholdModule {}
