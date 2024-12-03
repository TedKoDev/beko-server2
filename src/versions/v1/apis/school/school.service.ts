import { PrismaService } from '@/prisma';
import { Injectable } from '@nestjs/common';
import { CreateSchoolDto } from './dto/create-school.dto';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolService {
  constructor(private prisma: PrismaService) {}

  async create(createSchoolDto: CreateSchoolDto) {
    return this.prisma.koreanSchool.create({
      data: createSchoolDto,
    });
  }

  async findAll(pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      // Get total count
      this.prisma.koreanSchool.count({
        where: {
          deleted_at: null,
        },
      }),
      // Get paginated items
      this.prisma.koreanSchool.findMany({
        where: {
          deleted_at: null,
        },
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
      }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByRegion(region: string, pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      // Get total count
      this.prisma.koreanSchool.count({
        where: {
          region,
          deleted_at: null,
        },
      }),
      // Get paginated items
      this.prisma.koreanSchool.findMany({
        where: {
          region,
          deleted_at: null,
        },
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
      }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(school_id: number) {
    return this.prisma.koreanSchool.findUnique({
      where: { school_id },
    });
  }

  async update(school_id: number, updateSchoolDto: UpdateSchoolDto) {
    return this.prisma.koreanSchool.update({
      where: { school_id },
      data: {
        ...updateSchoolDto,
        updated_at: new Date(),
      },
    });
  }

  async remove(school_id: number) {
    return this.prisma.koreanSchool.update({
      where: { school_id },
      data: {
        deleted_at: new Date(),
      },
    });
  }
}
