import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/prisma';
import { GameResultDto } from './dto/game-result.dto';
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
  ): Promise<GameResultDto> {
    const { questionId, answer, sessionId } = submitAnswerDto;

    // 트랜잭션으로 처리
    return await this.prisma.$transaction(async (prisma) => {
      // 문제 확인
      const question = await prisma.gameQuestion.findUnique({
        where: { question_id: questionId },
      });

      if (!question) {
        throw new NotFoundException('문제를 찾을 수 없습니다.');
      }

      const isCorrect = question.answer === answer;
      let experienceGained = 0;
      let levelCompleted = false;
      let gameLeveledUp = false;
      let userLeveledUp = false;

      // 게임 진행 상태 조회
      const previousProgress = await prisma.userGameProgress.findUnique({
        where: {
          user_id_game_type_id: {
            user_id: userId,
            game_type_id: gameTypeId,
          },
        },
      });

      const previousLevel = previousProgress?.current_level || 1;

      // 답변 기록
      await prisma.imageMatchingAnswer.create({
        data: {
          user_id: userId,
          question_id: questionId,
          answer: answer,
          is_correct: isCorrect,
          session_id: sessionId,
        },
      });

      // 사용자 정보 조회
      const user = await prisma.users.findUnique({
        where: { user_id: userId },
        select: {
          level: true,
          experience_points: true,
          login_count: true,
        },
      });

      if (!user) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      const previousUserLevel = user.level;
      let currentUserLevel = previousUserLevel;
      let currentExperience = user.experience_points;

      if (isCorrect) {
        // 현재 레벨의 모든 문제를 풀었는지 확인
        const [currentLevelQuestions, currentLevelCorrectAnswers] =
          await Promise.all([
            prisma.gameQuestion.count({
              where: {
                game_type_id: gameTypeId,
                level: previousLevel,
                deleted_at: null,
              },
            }),
            prisma.imageMatchingAnswer.count({
              where: {
                user_id: userId,
                is_correct: true,
                session_id: sessionId,
                gameQuestion: {
                  game_type_id: gameTypeId,
                  level: previousLevel,
                },
              },
            }),
          ]);

        // 레벨의 모든 문제를 맞췄는지 확인
        levelCompleted = currentLevelQuestions === currentLevelCorrectAnswers;

        if (levelCompleted) {
          experienceGained = 10 * previousLevel; // 레벨이 높을수록 더 많은 경험치
          currentExperience += experienceGained;

          // 게임 레벨 업데이트
          await prisma.userGameProgress.update({
            where: {
              user_id_game_type_id: {
                user_id: userId,
                game_type_id: gameTypeId,
              },
            },
            data: {
              current_level: { increment: 1 },
              max_level: {
                increment: previousProgress?.max_level <= previousLevel ? 1 : 0,
              },
              total_correct: { increment: 1 },
              total_attempts: { increment: 1 },
              last_played_at: new Date(),
            },
          });

          gameLeveledUp = true;

          // 경험치만 업데이트
          await prisma.users.update({
            where: { user_id: userId },
            data: {
              experience_points: currentExperience,
            },
          });

          // 레벨업 체크는 별도로 수행
          const levelThreshold = await prisma.levelthreshold.findUnique({
            where: { level: previousUserLevel },
          });

          // 레벨업 조건 체크를 더 엄격하게 수정
          if (levelThreshold) {
            // 현재 경험치가 필요 경험치보다 크거나 같은지 확인
            console.log('Current Experience:', currentExperience);
            console.log('Required Experience:', levelThreshold.min_experience);
            console.log('Current Login Count:', user.login_count);
            console.log('Required Login Count:', levelThreshold.min_logins);

            // level 1에서는 레벨업이 되지 않도록 수정
            const canLevelUp =
              previousUserLevel > 1 && // level 1에서는 레벨업 불가
              currentExperience >= levelThreshold.min_experience &&
              levelThreshold.min_logins <= user.login_count;

            if (canLevelUp) {
              currentUserLevel = previousUserLevel + 1;
              currentExperience -= levelThreshold.min_experience;
              userLeveledUp = true;

              await prisma.users.update({
                where: { user_id: userId },
                data: {
                  level: currentUserLevel,
                  experience_points: currentExperience,
                  points: { increment: 100 }, // 레벨업 보상 포인트
                },
              });
            } else {
              // 레벨업 조건을 만족하지 못한 경우 경험치만 업데이트
              await prisma.users.update({
                where: { user_id: userId },
                data: {
                  experience_points: currentExperience,
                },
              });
            }
          }
        } else {
          // 일반 정답 처리
          if (!previousProgress) {
            // 레코드가 없으면 생성
            await prisma.userGameProgress.create({
              data: {
                user_id: userId,
                game_type_id: gameTypeId,
                total_correct: 1,
                total_attempts: 1,
                current_level: 1,
                max_level: 1,
                last_played_at: new Date(),
              },
            });
          } else {
            // 레코드가 있으면 업데이트
            await prisma.userGameProgress.update({
              where: {
                user_id_game_type_id: {
                  user_id: userId,
                  game_type_id: gameTypeId,
                },
              },
              data: {
                total_correct: { increment: 1 },
                total_attempts: { increment: 1 },
                last_played_at: new Date(),
              },
            });
          }
        }
      } else {
        // 오답 처리
        if (!previousProgress) {
          // 레코드가 없으면 생성
          await prisma.userGameProgress.create({
            data: {
              user_id: userId,
              game_type_id: gameTypeId,
              total_correct: 0,
              total_attempts: 1,
              current_level: 1,
              max_level: 1,
              last_played_at: new Date(),
            },
          });
        } else {
          // 레코드가 있으면 업데이트
          await prisma.userGameProgress.update({
            where: {
              user_id_game_type_id: {
                user_id: userId,
                game_type_id: gameTypeId,
              },
            },
            data: {
              total_attempts: { increment: 1 },
              last_played_at: new Date(),
            },
          });
        }
      }

      // 최종 게임 진행 상태 조회
      const currentProgress = await prisma.userGameProgress.findUnique({
        where: {
          user_id_game_type_id: {
            user_id: userId,
            game_type_id: gameTypeId,
          },
        },
      });

      return {
        isCorrect,
        correctAnswer: question.answer,
        gameProgress: {
          previousLevel,
          currentLevel: currentProgress?.current_level || 1,
          leveledUp: gameLeveledUp,
          totalCorrect: currentProgress?.total_correct || 0,
          totalQuestions: await prisma.gameQuestion.count({
            where: {
              game_type_id: gameTypeId,
              level: previousLevel,
              deleted_at: null,
            },
          }),
          isLevelCompleted: levelCompleted,
        },
        userProgress: {
          experienceGained,
          currentExperience,
          previousUserLevel,
          currentUserLevel,
          userLeveledUp,
        },
      };
    });
  }

  async getGameProgress(userId: number, gameTypeId: number) {
    const [gameType, progress] = await Promise.all([
      this.prisma.gameType.findUnique({
        where: { game_type_id: gameTypeId },
        select: {
          name: true,
          description: true,
        },
      }),
      this.prisma.userGameProgress.findUnique({
        where: {
          user_id_game_type_id: {
            user_id: userId,
            game_type_id: gameTypeId,
          },
        },
      }),
    ]);

    if (!gameType) {
      throw new NotFoundException('게임을 찾을 수 없습니다.');
    }

    return {
      game_type_id: gameTypeId,
      game_name: gameType.name,
      description: gameType.description,
      progress: progress
        ? {
            current_level: progress.current_level,
            max_level: progress.max_level,
            total_correct: progress.total_correct,
            total_attempts: progress.total_attempts,
            accuracy:
              progress.total_attempts > 0
                ? (progress.total_correct / progress.total_attempts) * 100
                : 0,
            last_played_at: progress.last_played_at,
          }
        : {
            current_level: 1,
            max_level: 1,
            total_correct: 0,
            total_attempts: 0,
            accuracy: 0,
            last_played_at: null,
          },
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

  // 모든 게임의 진행상황 조회
  async getAllGameProgress(userId: number) {
    const allGameTypes = await this.prisma.gameType.findMany({
      select: {
        game_type_id: true,
        name: true,
        description: true,
      },
    });

    const progressPromises = allGameTypes.map(async (gameType) => {
      const progress = await this.prisma.userGameProgress.findUnique({
        where: {
          user_id_game_type_id: {
            user_id: userId,
            game_type_id: gameType.game_type_id,
          },
        },
      });

      return {
        game_type_id: gameType.game_type_id,
        game_name: gameType.name,
        description: gameType.description,
        progress: progress
          ? {
              current_level: progress.current_level,
              max_level: progress.max_level,
              total_correct: progress.total_correct,
              total_attempts: progress.total_attempts,
              accuracy:
                progress.total_attempts > 0
                  ? (progress.total_correct / progress.total_attempts) * 100
                  : 0,
              last_played_at: progress.last_played_at,
            }
          : {
              current_level: 1,
              max_level: 1,
              total_correct: 0,
              total_attempts: 0,
              accuracy: 0,
              last_played_at: null,
            },
      };
    });

    return Promise.all(progressPromises);
  }

  async getGameLevelInfo(gameTypeId: number) {
    // 게임 타입 확인
    const gameType = await this.prisma.gameType.findUnique({
      where: { game_type_id: gameTypeId },
      select: {
        name: true,
        description: true,
      },
    });

    if (!gameType) {
      throw new NotFoundException('해당 게임을 찾을 수 없습니다.');
    }

    // 해당 게임의 모든 레벨별 문제 수 조회
    const levelCounts = await this.prisma.gameQuestion.groupBy({
      by: ['level'],
      where: {
        game_type_id: gameTypeId,
        deleted_at: null,
      },
      _count: {
        question_id: true,
      },
      orderBy: {
        level: 'asc',
      },
    });

    // 최소, 최대 레벨 계산
    const minLevel = levelCounts[0]?.level ?? 0;
    const maxLevel = levelCounts[levelCounts.length - 1]?.level ?? 0;

    return {
      game_type_id: gameTypeId,
      game_name: gameType.name,
      description: gameType.description,
      level_info: {
        min_level: minLevel,
        max_level: maxLevel,
        levels: levelCounts.map((level) => ({
          level: level.level,
          question_count: level._count.question_id,
        })),
      },
    };
  }
}
