import { PrismaService } from '@/prisma';
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth';
import { AuthService } from '../auth/auth.service';
import { CountryModule } from '../country/country.module';
import { LevelThresholdService } from '../level/level.service';
import { PointsModule } from '../point/points.module';
import { SlackModule } from '../utils/slack/slack.module';
import { UserController } from './user.controller';
import { UserProvider } from './user.provider';

@Module({
  imports: [AuthModule, CountryModule, PointsModule, SlackModule],
  providers: [PrismaService, UserProvider, AuthService, LevelThresholdService],
  controllers: [UserController],
  exports: [UserProvider],
})
export class UserModule {}
