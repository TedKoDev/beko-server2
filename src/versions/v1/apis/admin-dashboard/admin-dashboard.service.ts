import { PrismaService } from '@/prisma';
import { Injectable } from '@nestjs/common';

import { DashboardSummaryDto } from './dto/dashboard-summary.dto';
import { DateRangeDto } from './dto/date-range.dto';
import { StatsResponse } from './dto/stats-response.dto';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private async calculateStats(
    model: any,
    dateField: string = 'created_at',
    whereClause: any = {},
  ): Promise<StatsResponse> {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const weekAgo = new Date(now.setDate(now.getDate() - 7));
    const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
    const previousMonth = new Date(now.setMonth(now.getMonth() - 1));

    const [total, todayCount, weeklyCount, monthlyCount, previousMonthCount] =
      await Promise.all([
        model.count({ where: whereClause }),
        model.count({
          where: {
            ...whereClause,
            [dateField]: { gte: today },
          },
        }),
        model.count({
          where: {
            ...whereClause,
            [dateField]: { gte: weekAgo },
          },
        }),
        model.count({
          where: {
            ...whereClause,
            [dateField]: { gte: monthAgo },
          },
        }),
        model.count({
          where: {
            ...whereClause,
            [dateField]: {
              gte: previousMonth,
              lt: monthAgo,
            },
          },
        }),
      ]);

    const growth =
      previousMonthCount === 0
        ? 100
        : ((monthlyCount - previousMonthCount) / previousMonthCount) * 100;

    return {
      total,
      today: todayCount,
      weekly: weeklyCount,
      monthly: monthlyCount,
      growth,
    };
  }

  async getUserStats(query: DateRangeDto): Promise<StatsResponse> {
    return this.calculateStats(this.prisma.users);
  }

  async getPostStats(query: DateRangeDto): Promise<StatsResponse> {
    return this.calculateStats(this.prisma.post);
  }

  async getCommentStats(_query: DateRangeDto): Promise<StatsResponse> {
    return this.calculateStats(this.prisma.comment);
  }

  async getGameStats(_query: DateRangeDto): Promise<StatsResponse> {
    return this.calculateStats(this.prisma.userGameProgress);
  }

  async getPointStats(_query: DateRangeDto): Promise<StatsResponse> {
    return this.calculateStats(this.prisma.point);
  }

  async getReportStats(_query: DateRangeDto): Promise<StatsResponse> {
    return this.calculateStats(this.prisma.report);
  }

  async getBannerStats(_query: DateRangeDto): Promise<StatsResponse> {
    return this.calculateStats(this.prisma.adBanner);
  }

  async getDashboardSummary(): Promise<DashboardSummaryDto> {
    const [users, posts, comments, games, points, reports, banners] =
      await Promise.all([
        this.getUserStats({}),
        this.getPostStats({}),
        this.getCommentStats({}),
        this.getGameStats({}),
        this.getPointStats({}),
        this.getReportStats({}),
        this.getBannerStats({}),
      ]);

    return {
      users,
      posts,
      comments,
      games,
      points,
      reports,
      banners,
    };
  }
}
