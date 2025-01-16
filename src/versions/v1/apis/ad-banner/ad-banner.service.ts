import { PrismaService } from '@/prisma';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateAdBannerDto, UpdateAdBannerDto } from './dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Injectable()
export class AdBannerService {
  constructor(private readonly prisma: PrismaService) {}

  async createAdBanner(dto: CreateAdBannerDto) {
    return this.prisma.adBanner.create({ data: dto });
  }

  async updateAdBanner(id: number, dto: UpdateAdBannerDto) {
    return this.prisma.adBanner.update({
      where: { id },
      data: {
        ...dto,
        updated_at: new Date(),
      },
    });
  }

  async findAll(paginationQuery: PaginationQueryDto) {
    const { page = 1, limit = 10, sort, search } = paginationQuery;
    const skip = (page - 1) * limit;

    let orderBy: Prisma.AdBannerOrderByWithRelationInput = {
      created_at: 'desc',
    };

    if (sort === 'oldest') {
      orderBy = { created_at: 'asc' };
    } else if (sort === 'popular') {
      orderBy = { view_count: 'desc' };
    }

    return this.prisma.adBanner.findMany({
      where: {
        deleted_at: null,
        ...(search && {
          company_name: {
            contains: search,
            mode: 'insensitive',
          },
        }),
      },
      skip,
      take: limit,
      orderBy,
    });
  }

  async findOne(id: number, fromApp: boolean) {
    return this.prisma.$transaction(async (tx) => {
      const adBanner = await tx.adBanner.findFirst({
        where: { id, deleted_at: null },
      });

      if (adBanner && fromApp) {
        await tx.adBanner.update({
          where: { id },
          data: { view_count: { increment: 1 } },
        });
      }

      return adBanner;
    });
  }

  async remove(id: number) {
    return this.prisma.adBanner.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
