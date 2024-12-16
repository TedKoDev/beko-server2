// src/posts/posts.controller.ts
import { Auth } from '@/decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';

import { WordService } from './word.service';
@Controller({
  path: 'word',
  version: '1',
})
export class WordController {
  constructor(private readonly WordService: WordService) {}

  @Auth(['ANY'])
  @Get()
  async getWords() {
    return await this.WordService.getWords();
  }

  @Auth(['ANY'])
  @Get('word-list')
  async getWordList(
    @Req() req: { user: { userId: number } }, // 토큰에서 유저 아이디 추출
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.WordService.getWordList(req.user.userId, page, limit);
  }

  @Post('user-word')
  @Auth(['ANY'])
  async addToUserWordList(
    @Req() req: { user: { userId: number } },
    @Body() body: { word_id: number; notes?: string },
  ) {
    console.log(
      'addToUserWordList controller',
      req.user.userId,
      body.word_id,
      body.notes,
    );
    return this.WordService.addToUserWordList(
      req.user.userId,
      body.word_id,
      body.notes,
    );
  }

  @Post('new-word')
  @Auth(['ANY'])
  async createNewWord(
    @Req() req: { user: { userId: number } },
    @Body()
    wordData: {
      word: string;
      part_of_speech: string;
      meaning_en: string;
      example_sentence?: string;
      example_translation?: string;
      notes?: string;
    },
  ) {
    return this.WordService.createNewWord(req.user.userId, wordData);
  }

  @Get('user-words')
  @Auth(['ANY'])
  async getUserWordList(
    @Req() req: { user: { userId: number } },
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.WordService.getUserWordList(req.user.userId, page, limit);
  }

  @Delete('user-word/:wordId')
  @Auth(['ANY'])
  async removeFromUserWordList(
    @Req() req: { user: { userId: number } },
    @Param('wordId') wordId: number,
  ) {
    return this.WordService.removeFromUserWordList(req.user.userId, wordId);
  }

  @Get('search')
  async searchWords(
    @Query('keyword') keyword: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.WordService.searchWords(keyword, page, limit);
  }

  @Put('user-word/:wordId')
  @Auth(['ANY'])
  async updateUserWord(
    @Req() req: { user: { userId: number } },
    @Param('wordId') wordId: number,
    @Body() body: { notes?: string },
  ) {
    return this.WordService.updateUserWord(req.user.userId, wordId, body.notes);
  }
}
