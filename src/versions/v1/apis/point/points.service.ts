// src/points/points.service.ts
import { PrismaService } from '@/prisma/postsql-prisma.service';
import { Injectable } from '@nestjs/common';
import { CreatePointDto } from './dto/create-point.dto';
import { PaginationQueryDto } from './dto/pagination.dto';

@Injectable()
export class PointsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createPointDto: CreatePointDto) {
    return this.prisma.point.create({
      data: {
        user_id: userId,
        points_change: createPointDto.pointsChange,
        change_reason: createPointDto.changeReason,
      },
    });
  }

  async findAll(userId: number, paginationQuery: PaginationQueryDto) {
    console.log(paginationQuery);
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [points, totalCount] = await Promise.all([
      this.prisma.point.findMany({
        where: { user_id: userId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.point.count({ where: { user_id: userId } }),
    ]);

    return {
      data: points,
      total: totalCount,
      page,
      limit,
    };
  }
}
