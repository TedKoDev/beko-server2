import { PrismaService } from '@/prisma';
import { Injectable } from '@nestjs/common';
import { PointsService } from '../point';

@Injectable()
export class LevelThresholdService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pointsService: PointsService,
  ) {}

  // 레벨 기준 생성 또는 업데이트
  async createOrUpdateThreshold(level: number, min_experience: number) {
    return this.prisma.levelthreshold.upsert({
      where: { level },
      update: { min_experience },
      create: {
        level,
        min_experience,
        // 다른 필드들은 기본값 0으로 설정
        min_posts: 0,
        min_comments: 0,
        min_likes: 0,
        min_logins: 0,
      },
    });
  }

  // 모든 레벨 기준 가져오기
  async getAllThresholds() {
    return this.prisma.levelthreshold.findMany({
      select: {
        level: true,
        min_experience: true,
      },
      orderBy: {
        level: 'asc',
      },
    });
  }

  // 특정 레벨 기준 가져오기
  async getThresholdByLevel(level: number) {
    return this.prisma.levelthreshold.findUnique({
      where: { level },
      select: {
        level: true,
        min_experience: true,
      },
    });
  }

  // 특정 레벨 기준 삭제
  async deleteThreshold(level: number) {
    return this.prisma.levelthreshold.delete({ where: { level } });
  }

  // 사용자의 현재 레벨 정보 조회
  async getUserLevelInfo(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
      select: {
        level: true,
        experience_points: true,
      },
    });

    if (!user) return null;
    // 현재 레벨의 경험치 요구사항
    await this.prisma.levelthreshold.findUnique({
      where: { level: user.level },
      select: { min_experience: true },
    });

    // 다음 레벨의 경험치 요구사항
    const nextLevelThreshold = await this.prisma.levelthreshold.findUnique({
      where: { level: user.level + 1 },
      select: { min_experience: true },
    });

    return {
      currentLevel: user.level,
      currentXP: user.experience_points,
      requiredXPForNextLevel: nextLevelThreshold?.min_experience ?? null,
      progress: nextLevelThreshold
        ? (user.experience_points / nextLevelThreshold.min_experience) * 100
        : 100,
    };
  }

  // 레벨업 체크 및 처리
  async checkAndProcessLevelUp(userId: number): Promise<{
    leveledUp: boolean;
    newLevel?: number;
    experienceRemaining?: number;
  }> {
    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.users.findUnique({
        where: { user_id: userId },
        select: {
          level: true,
          experience_points: true,
        },
      });

      if (!user) {
        return { leveledUp: false };
      }

      const nextLevelThreshold = await prisma.levelthreshold.findUnique({
        where: { level: user.level + 1 },
      });

      if (
        !nextLevelThreshold ||
        user.experience_points < nextLevelThreshold.min_experience
      ) {
        return { leveledUp: false };
      }

      const experienceRemaining = user.experience_points;

      // 레벨업 처리
      const updatedUser = await prisma.users.update({
        where: { user_id: userId },
        data: {
          level: { increment: 1 },
          experience_points: experienceRemaining,
        },
      });

      // 레벨업 보상 포인트 지급 및 로그 기록
      await this.pointsService.create(userId, {
        pointsChange: 100,
        changeReason: `Level up reward (Level ${user.level} → ${updatedUser.level})`,
      });

      return {
        leveledUp: true,
        newLevel: updatedUser.level,
        experienceRemaining,
      };
    });
  }
}
