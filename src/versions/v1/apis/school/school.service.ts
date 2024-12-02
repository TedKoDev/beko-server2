import { PrismaService } from '@/prisma';
import { Injectable } from '@nestjs/common';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolService {
  constructor(private prisma: PrismaService) {}

  async create(createSchoolDto: CreateSchoolDto) {
    return this.prisma.koreanSchool.create({
      data: createSchoolDto,
    });
  }

  async findAll() {
    return this.prisma.koreanSchool.findMany({
      where: {
        deleted_at: null,
      },
    });
  }

  async findOne(school_id: number) {
    return this.prisma.koreanSchool.findUnique({
      where: { school_id },
    });
  }

  async findByRegion(region: string) {
    return this.prisma.koreanSchool.findMany({
      where: {
        region,
        deleted_at: null,
      },
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
