import { PrismaService } from '@/prisma/postsql-prisma.service';
import { Injectable } from '@nestjs/common';
import { LogType } from '@prisma/client';

@Injectable()
export class LogsService {
  constructor(private prisma: PrismaService) {}

  async createYoutubeLink(data: any) {
    console.log('data inside service', data);
    const youtubeLink = await this.prisma.youtubelink.create({
      data: {
        link: data.link,
        name: data.name,
        topic: data.topic,
        filelink: data.filelink,
      },
    });

    return youtubeLink;
  }

  async deleteYoutubeLink(link_id: number) {
    return this.prisma.youtubelink.delete({
      where: {
        link_id,
      },
    });
  }

  async updateYoutubeLink(link_id: number, data: any) {
    console.log(link_id);
    console.log(data);
    return this.prisma.youtubelink.update({
      where: {
        link_id,
      },
      data: {
        link: data.link,
        name: data.name,
        topic: data.topic,
        filelink: data.filelink,
      },
    });
  }

  async getLogCount(type: LogType) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 오늘 날짜의 시작시간으로 설정

    const log = await this.prisma.log.findFirst({
      where: {
        type,
        created_at: {
          gte: today,
        },
      },
      select: {
        count: true,
      },
    });

    return {
      type,
      count: log?.count ?? 0,
    };
  }

  async getRandomYoutubeLink() {
    // 랜덤으로 유튜브 링크 하나를 가져옴
    const totalLinks = await this.prisma.youtubelink.count({
      where: {
        deleted_at: null,
      },
    });

    const skip = Math.floor(Math.random() * totalLinks);

    const link = await this.prisma.youtubelink.findFirst({
      where: {
        deleted_at: null,
      },
      skip,
      take: 1,
      select: {
        link_id: true,
        link: true,
        created_at: true,
      },
    });

    return link;
  }

  async getAllYoutubeLinks() {
    return this.prisma.youtubelink.findMany({
      where: {
        deleted_at: null,
      },
      select: {
        link_id: true,
        link: true,
        name: true,
        topic: true,
        filelink: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }
}
