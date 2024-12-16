import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GetLogCountDto } from './dto/logs.dto';
import { LogsService } from './logs.service';

@Controller({
  path: 'logs',
  version: '1',
})
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post('youtube/create')
  async createYoutubeLink(@Body() dto: any) {
    return this.logsService.createYoutubeLink(dto.link, dto.name, dto.topic);
  }

  @Get('count')
  async getLogCount(@Query() dto: GetLogCountDto) {
    return this.logsService.getLogCount(dto.type);
  }

  @Get('youtube/random')
  async getRandomYoutubeLink() {
    return this.logsService.getRandomYoutubeLink();
  }

  @Get('youtube/all')
  async getAllYoutubeLinks() {
    return this.logsService.getAllYoutubeLinks();
  }
}
