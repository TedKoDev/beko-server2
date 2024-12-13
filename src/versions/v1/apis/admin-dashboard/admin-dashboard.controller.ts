import { Auth } from '@/decorators';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminDashboardService } from './admin-dashboard.service';
import { DashboardSummaryDto, DateRangeDto, StatsResponse } from './dto/index';

@ApiTags('관리자 대시보드')
@Controller({
  path: 'admin/dashboard',
  version: '1',
})
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  // 관리자 대시보드 요약
  @Auth(['ADMIN'])
  @Get('summary')
  @ApiOperation({ summary: '대시보드 요약 정보' })
  async getDashboardSummary(): Promise<DashboardSummaryDto> {
    return this.dashboardService.getDashboardSummary();
  }

  // 사용자 통계
  @Auth(['ADMIN'])
  @Get('users')
  @ApiOperation({ summary: '사용자 통계' })
  async getUserStats(@Query() query: DateRangeDto): Promise<StatsResponse> {
    return this.dashboardService.getUserStats(query);
  }

  // 게시글 통계
  @Auth(['ADMIN'])
  @Get('posts')
  @ApiOperation({ summary: '게시글 통계' })
  async getPostStats(@Query() query: DateRangeDto): Promise<StatsResponse> {
    return this.dashboardService.getPostStats(query);
  }

  // 댓글 통계
  @Auth(['ADMIN'])
  @Get('comments')
  @ApiOperation({ summary: '댓글 통계' })
  async getCommentStats(@Query() query: DateRangeDto): Promise<StatsResponse> {
    return this.dashboardService.getCommentStats(query);
  }

  // 게임 통계
  @Auth(['ADMIN'])
  @Get('games')
  @ApiOperation({ summary: '게임 통계' })
  async getGameStats(@Query() query: DateRangeDto): Promise<StatsResponse> {
    return this.dashboardService.getGameStats(query);
  }

  // 포인트 통계
  @Auth(['ADMIN'])
  @Get('points')
  @ApiOperation({ summary: '포인트/경험치 통계' })
  async getPointStats(@Query() query: DateRangeDto): Promise<StatsResponse> {
    return this.dashboardService.getPointStats(query);
  }

  // 신고 통계
  @Auth(['ADMIN'])
  @Get('reports')
  @ApiOperation({ summary: '신고 처리 현황' })
  async getReportStats(@Query() query: DateRangeDto): Promise<StatsResponse> {
    return this.dashboardService.getReportStats(query);
  }

  // 배너 통계
  @Auth(['ADMIN'])
  @Get('banners')
  @ApiOperation({ summary: '배너 통계' })
  async getBannerStats(@Query() query: DateRangeDto): Promise<StatsResponse> {
    return this.dashboardService.getBannerStats(query);
  }
}
