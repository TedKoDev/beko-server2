import { Module } from '@nestjs/common';

import { PrismaService } from '@/prisma';
import { LevelThresholdService } from '../level';
import { PointsModule } from '../point/points.module';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';

@Module({
  imports: [PointsModule],
  controllers: [GamesController],
  providers: [GamesService, PrismaService, LevelThresholdService],
  exports: [GamesService],
})
export class GamesModule {}
