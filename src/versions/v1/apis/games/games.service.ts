import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/prisma';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  async getImageMatchingQuestions(
    gameTypeId: number,
    level: number,
    limit: number,
  ) {
    const questions = await this.prisma.gameQuestion.findMany({
      where: {
        game_type_id: gameTypeId,
        level: level,
      },
      select: {
        question_id: true,
        image_url: true,
        options: true,
        level: true,
      },
      take: limit,
    });

    if (!questions.length) {
      throw new NotFoundException('해당 레벨의 문제를 찾을 수 없습니다.');
    }

    return questions;
  }

  async submitAnswer(
    userId: number,
    gameTypeId: number,
    submitAnswerDto: SubmitAnswerDto,
  ) {
    const { questionId, answer } = submitAnswerDto;

    // 문제 확인
    const question = await this.prisma.gameQuestion.findUnique({
      where: { question_id: questionId },
    });

    if (!question) {
      throw new NotFoundException('문제를 찾을 수 없습니다.');
    }

    const isCorrect = question.answer === answer;

    // 답변 기록
    await this.prisma.imageMatchingAnswer.create({
      data: {
        user_id: userId,
        question_id: questionId,
        answer: answer,
        is_correct: isCorrect,
      },
    });

    // 진행상황 업데이트
    await this.updateGameProgress(userId, gameTypeId, isCorrect);

    return {
      isCorrect,
      correctAnswer: question.answer,
    };
  }

  private async updateGameProgress(
    userId: number,
    gameTypeId: number,
    isCorrect: boolean,
  ) {
    // 트랜잭션으로 처리
    await this.prisma.$transaction(async (prisma) => {
      const progress = await prisma.userGameProgress.findUnique({
        where: {
          user_id_game_type_id: {
            user_id: userId,
            game_type_id: gameTypeId,
          },
        },
      });

      // 게임 진행상황 업데이트
      if (progress) {
        await prisma.userGameProgress.update({
          where: {
            user_id_game_type_id: {
              user_id: userId,
              game_type_id: gameTypeId,
            },
          },
          data: {
            total_attempts: { increment: 1 },
            total_correct: isCorrect ? { increment: 1 } : undefined,
            last_played_at: new Date(),
          },
        });
      } else {
        await prisma.userGameProgress.create({
          data: {
            user_id: userId,
            game_type_id: gameTypeId,
            total_attempts: 1,
            total_correct: isCorrect ? 1 : 0,
          },
        });
      }

      // 정답인 경우에만 경험치 부여
      if (isCorrect) {
        const xpGained = 10; // 기본 경험치 획득량

        await prisma.users.update({
          where: { user_id: userId },
          data: {
            experience_points: {
              increment: xpGained,
            },
          },
        });

        // 레벨업 체크 및 처리
        await this.checkAndProcessLevelUp(userId);
      }
    });
  }

  private async checkAndProcessLevelUp(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
      select: {
        level: true,
        experience_points: true,
      },
    });

    if (!user) return;

    // 현재 레벨에 대한 기준 가져오기
    const levelThreshold = await this.prisma.levelthreshold.findUnique({
      where: { level: user.level },
    });

    if (!levelThreshold) return;

    // 경험치와 다른 조건을 모두 만족하는지 확인
    const canLevelUp =
      user.experience_points >= levelThreshold.min_experience &&
      // 다른 조건들도 추가 가능
      // 예: user.posts >= levelThreshold.min_posts
      // 예: user.comments >= levelThreshold.min_comments
      true;

    if (canLevelUp) {
      await this.prisma.users.update({
        where: { user_id: userId },
        data: {
          level: { increment: 1 },
          experience_points:
            user.experience_points - levelThreshold.min_experience, // 남은 경험치
          points: { increment: 100 }, // 레벨업 보상 포인트
        },
      });
    }
  }

  async getGameProgress(userId: number, gameTypeId: number) {
    const progress = await this.prisma.userGameProgress.findUnique({
      where: {
        user_id_game_type_id: {
          user_id: userId,
          game_type_id: gameTypeId,
        },
      },
    });

    if (!progress) {
      return {
        current_level: 1,
        max_level: 1,
        total_correct: 0,
        total_attempts: 0,
        accuracy: 0,
      };
    }

    return {
      ...progress,
      accuracy:
        progress.total_attempts > 0
          ? (progress.total_correct / progress.total_attempts) * 100
          : 0,
    };
  }

  async getLeaderboard(gameTypeId: number) {
    const leaderboard = await this.prisma.userGameProgress.findMany({
      where: {
        game_type_id: gameTypeId,
        total_attempts: {
          gt: 0,
        },
      },
      select: {
        user: {
          select: {
            username: true,
            profile_picture_url: true,
          },
        },
        total_correct: true,
        total_attempts: true,
        max_level: true,
      },
      orderBy: [{ max_level: 'desc' }, { total_correct: 'desc' }],
      take: 10,
    });

    return leaderboard.map((entry) => ({
      username: entry.user.username,
      profile_picture_url: entry.user.profile_picture_url,
      max_level: entry.max_level,
      total_correct: entry.total_correct,
      accuracy: (entry.total_correct / entry.total_attempts) * 100,
    }));
  }

  async getGameTypes() {
    const gameTypes = await this.prisma.gameType.findMany({
      select: {
        game_type_id: true,
        name: true,
        description: true,
      },
    });

    return gameTypes;
  }
}
