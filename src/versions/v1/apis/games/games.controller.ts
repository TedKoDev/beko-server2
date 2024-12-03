import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Auth } from '@/decorators';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { GamesService } from './games.service';

@ApiTags('게임')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get('image-matching/questions')
  @ApiOperation({ summary: '이미지 매칭 게임 문제 조회' })
  @Auth(['ANY'])
  async getImageMatchingQuestions(
    @Query('level') level: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.gamesService.getImageMatchingQuestions(level, limit);
  }

  @Post('image-matching/submit')
  @ApiOperation({ summary: '이미지 매칭 게임 답안 제출' })
  @Auth(['ANY'])
  async submitImageMatchingAnswer(
    @Req() req: { user: { userId: number } },
    @Body() submitAnswerDto: SubmitAnswerDto,
  ) {
    const userId = req.user.userId;
    return this.gamesService.submitImageMatchingAnswer(userId, submitAnswerDto);
  }

  @Get('image-matching/progress')
  @ApiOperation({ summary: '이미지 매칭 게임 진행상황 조회' })
  @Auth(['ANY'])
  async getImageMatchingProgress(@Req() req: { user: { userId: number } }) {
    const userId = req.user.userId;
    return this.gamesService.getGameProgress(userId, 1); // 1은 이미지 매칭 게임의 ID
  }

  @Get('image-matching/leaderboard')
  @ApiOperation({ summary: '이미지 매칭 게임 리더보드' })
  async getImageMatchingLeaderboard() {
    return this.gamesService.getLeaderboard(1); // 1은 이미지 매칭 게임의 ID
  }
}
