import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { GetLogCountDto } from './dto/logs.dto';
import { YoutubeCreateDto } from './dto/youtubecreate';
import { LogsService } from './logs.service';

@Controller({
  path: 'logs',
  version: '1',
})
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post('youtube/create')
  async createYoutubeLink(@Body() dto: YoutubeCreateDto) {
    return this.logsService.createYoutubeLink(dto as YoutubeCreateDto);
  }

  @Put('youtube/update/:link_id')
  async updateYoutubeLink(@Param('link_id') link_id: number, @Body() dto: any) {
    console.log('link_id inside controller', link_id);
    console.log('dto inside controller', dto);
    return this.logsService.updateYoutubeLink(link_id, dto);
  }

  @Delete('youtube/delete/:link_id')
  async deleteYoutubeLink(@Param('link_id') link_id: number) {
    return this.logsService.deleteYoutubeLink(link_id);
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
