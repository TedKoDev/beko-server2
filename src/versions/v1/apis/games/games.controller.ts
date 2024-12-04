import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Auth } from '@/decorators';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { GamesService } from './games.service';

@ApiTags('게임')
@Controller({
  path: 'games',
  version: '1',
})
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get('types')
  @ApiOperation({ summary: '게임 종류 목록 조회' })
  async getGameTypes() {
    return this.gamesService.getGameTypes();
  }

  @Get('questions')
  @ApiOperation({ summary: '게임 문제 조회' })
  @Auth(['ANY'])
  async getQuestions(
    @Query('gameTypeId') gameTypeId: number,
    @Query('level') level: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.gamesService.getImageMatchingQuestions(
      gameTypeId,
      level,
      limit,
    );
  }

  @Post('submit')
  @ApiOperation({ summary: '게임 답안 제출' })
  @Auth(['ANY'])
  async submitAnswer(
    @Req() req: { user: { userId: number } },
    @Query('gameTypeId') gameTypeId: number,
    @Body() submitAnswerDto: SubmitAnswerDto,
  ) {
    const userId = req.user.userId;
    return this.gamesService.submitAnswer(userId, gameTypeId, submitAnswerDto);
  }

  @Get('progress')
  @ApiOperation({ summary: '게임 진행상황 조회' })
  @Auth(['ANY'])
  async getProgress(
    @Req() req: { user: { userId: number } },
    @Query('gameTypeId') gameTypeId: number,
  ) {
    const userId = req.user.userId;
    return this.gamesService.getGameProgress(userId, gameTypeId);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: '게임 리더보드' })
  async getLeaderboard(@Query('gameTypeId') gameTypeId: number) {
    return this.gamesService.getLeaderboard(gameTypeId);
  }

  @Get('all-progress')
  @ApiOperation({ summary: '모든 게임 진행상황 조회' })
  @Auth(['ANY'])
  async getAllProgress(@Req() req: { user: { userId: number } }) {
    const userId = req.user.userId;
    return this.gamesService.getAllGameProgress(userId);
  }

  @Get('types/:gameTypeId/levels')
  @ApiOperation({ summary: '게임 레벨 정보 조회' })
  @Auth(['ANY'])
  async getGameLevelInfo(@Param('gameTypeId') gameTypeId: number) {
    return this.gamesService.getGameLevelInfo(gameTypeId);
  }
}
