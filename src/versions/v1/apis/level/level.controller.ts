import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';

import { Auth } from '@/decorators/role-auth.decorator';
import { CreateOrUpdateLevelThresholdDto, GetLevelThresholdDto } from './dto';
import { LevelThresholdService } from './level.service';

@Controller({
  path: 'level',
  version: '1',
})
export class LevelThresholdController {
  constructor(private readonly levelThresholdService: LevelThresholdService) {}

  // 레벨 기준 생성 또는 업데이트 (관리자용)

  @Auth(['ADMIN'])
  @Post()
  async createOrUpdateThreshold(@Body() body: CreateOrUpdateLevelThresholdDto) {
    return this.levelThresholdService.createOrUpdateThreshold(
      body.level,
      body.min_experience,
    );
  }

  // 모든 레벨 기준 조회
  @Auth(['ANY'])
  @Get()
  async getAllThresholds() {
    return this.levelThresholdService.getAllThresholds();
  }

  // 특정 레벨 기준 조회
  @Auth(['ANY'])
  @Get(':level')
  async getThresholdByLevel(@Param() params: GetLevelThresholdDto) {
    return this.levelThresholdService.getThresholdByLevel(params.level);
  }

  // 특재 사용자의 레벨 정보 조회
  @Auth(['ANY'])
  @Get('user/info')
  async getUserLevelInfo(@Req() req: { user: { userId: number } }) {
    return this.levelThresholdService.getUserLevelInfo(req.user.userId);
  }

  // 특정 레벨 기준 삭제 (관리자용)
  @Auth(['ADMIN'])
  @Delete(':level')
  async deleteThreshold(@Param('level') level: number) {
    return this.levelThresholdService.deleteThreshold(level);
  }
}
