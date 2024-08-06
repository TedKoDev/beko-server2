// src/points/points.controller.ts
import { Auth } from '@/decorators';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreatePointDto } from './dto/create-point.dto';
import { PaginationQueryDto } from './dto/pagination.dto';
import { PointsService } from './points.service';

@Controller({
  path: 'points',
  version: '1',
})
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Auth(['ANY'])
  @Post(':userId')
  create(
    @Param('userId') userId: number,
    @Body() createPointDto: CreatePointDto,
  ) {
    return this.pointsService.create(userId, createPointDto);
  }

  @Auth(['ANY'])
  @Get(':userId')
  findAll(
    @Param('userId') userId: number,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.pointsService.findAll(userId, paginationQuery);
  }
}
