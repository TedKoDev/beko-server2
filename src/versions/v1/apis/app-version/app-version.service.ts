import { PrismaService } from '@/prisma/postsql-prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CheckVersionDto } from './dto/check-version.dto';
import { CreateVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';

@Injectable()
export class AppVersionService {
  constructor(private prisma: PrismaService) {}

  async checkVersion(checkVersionDto: CheckVersionDto) {
    const latestVersion = await this.prisma.appVersion.findFirst({
      where: {
        platform: checkVersionDto.platform,
        deleted_at: null,
      },
      orderBy: {
        build: 'desc',
      },
    });

    if (!latestVersion) {
      return {
        needsUpdate: false,
        required: false,
      };
    }

    const currentBuild = checkVersionDto.build;
    const needsUpdate = currentBuild < latestVersion.build;

    return {
      needsUpdate,
      required: needsUpdate && latestVersion.required,
      latestVersion: latestVersion.version,
      latestBuild: latestVersion.build,
      message: latestVersion.message,
    };
  }

  async create(createVersionDto: CreateVersionDto) {
    return this.prisma.appVersion.create({
      data: createVersionDto,
    });
  }

  async findAll() {
    return this.prisma.appVersion.findMany({
      where: {
        deleted_at: null,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const version = await this.prisma.appVersion.findUnique({
      where: { id },
    });

    if (!version || version.deleted_at) {
      throw new NotFoundException(`App version with ID ${id} not found`);
    }

    return version;
  }

  async update(id: number, updateVersionDto: UpdateVersionDto) {
    await this.findOne(id); // 존재 여부 확인

    return this.prisma.appVersion.update({
      where: { id },
      data: updateVersionDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // 존재 여부 확인

    return this.prisma.appVersion.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });
  }

  async getLatestByPlatform(platform: string) {
    return this.prisma.appVersion.findFirst({
      where: {
        platform,
        deleted_at: null,
      },
      orderBy: {
        build: 'desc',
      },
    });
  }
}
