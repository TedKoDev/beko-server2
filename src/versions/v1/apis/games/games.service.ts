import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/prisma';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  async getImageMatchingQuestions(level: number, limit: number) {
    const questions = await this.prisma.gameQuestion.findMany({
      where: {
        game_type_id: 1, // 이미지 매칭 게임
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

  async submitImageMatchingAnswer(
    userId: number,
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
    await this.updateGameProgress(userId, 1, isCorrect);

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
    const progress = await this.prisma.userGameProgress.findUnique({
      where: {
        user_id_game_type_id: {
          user_id: userId,
          game_type_id: gameTypeId,
        },
      },
    });

    if (progress) {
      await this.prisma.userGameProgress.update({
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
      await this.prisma.userGameProgress.create({
        data: {
          user_id: userId,
          game_type_id: gameTypeId,
          total_attempts: 1,
          total_correct: isCorrect ? 1 : 0,
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
}
