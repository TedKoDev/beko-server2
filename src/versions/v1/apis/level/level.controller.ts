import { Auth } from '@/decorators/role-auth.decorator';
import { Body, Controller, Post } from '@nestjs/common';
import { CreateOrUpdateLevelThresholdDto } from './dto';
import { LevelThresholdService } from './level.service';

@Controller({
  path: 'level',
  version: '1',
})
export class LevelThresholdController {
  constructor(private readonly levelThresholdService: LevelThresholdService) {}

  @Auth(['ADMIN'])
  @Post()
  async createOrUpdateThreshold(@Body() body: CreateOrUpdateLevelThresholdDto) {
    return this.levelThresholdService.createOrUpdateThreshold(
      body.level,
      body.min_experience,
    );
  }

  // ... 나머지 메서드들
}
