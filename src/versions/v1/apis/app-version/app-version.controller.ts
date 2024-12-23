import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AppVersionService } from './app-version.service';
import { CheckVersionDto } from './dto/check-version.dto';
import { CreateVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';

@Controller({
  path: 'app-version',
  version: '1',
})
export class AppVersionController {
  constructor(private readonly appVersionService: AppVersionService) {}

  @Get('check')
  async checkVersion(@Query() checkVersionDto: CheckVersionDto) {
    return this.appVersionService.checkVersion(checkVersionDto);
  }

  @Post()
  async create(@Body() createVersionDto: CreateVersionDto) {
    return this.appVersionService.create(createVersionDto);
  }

  @Get()
  async findAll() {
    return this.appVersionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.appVersionService.findOne(id);
  }

  @Get('platform/:platform')
  async getLatestByPlatform(@Param('platform') platform: string) {
    return this.appVersionService.getLatestByPlatform(platform);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVersionDto: UpdateVersionDto,
  ) {
    return this.appVersionService.update(id, updateVersionDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.appVersionService.remove(id);
  }
}
