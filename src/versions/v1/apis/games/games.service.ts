import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/prisma';
import { LevelThresholdService } from '../level';
import { AddImageGameQuestionDto } from './dto';
import { GameResultDto } from './dto/game-result.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Injectable()
export class GamesService {
  constructor(
    private prisma: PrismaService,
    private readonly levelThresholdService: LevelThresholdService,
  ) {}

  async addImageMatchingQuestion(dto: AddImageGameQuestionDto) {
    return this.prisma.gameQuestion.create({
      data: dto,
    });
  }

  async updateImageMatchingQuestion(questionId: number, dto: any) {
    return this.prisma.gameQuestion.update({
      where: { question_id: questionId },
      data: dto,
    });
  }

  async deleteImageMatchingQuestion(questionId: number) {
    return this.prisma.gameQuestion.update({
      where: { question_id: questionId },
      data: { deleted_at: new Date() },
    });
  }
  async getAllImageMatchingQuestionListwithPagenation(
    gameTypeId: number,
    level: number | null, // level을 선택적으로 변경
    page: number,
    limit: number,
  ) {
    console.log(gameTypeId, level, page, limit);

    // 전체 질문 수 조회
    const totalCount = await this.prisma.gameQuestion.count({
      where: {
        game_type_id: gameTypeId,
        ...(level !== null && { level }), // level이 null이 아닐 경우에만 추가
        deleted_at: null,
      },
    });

    // 현재 페이지의 질문 목록 조회
    const questions = await this.prisma.gameQuestion.findMany({
      where: {
        game_type_id: gameTypeId,
        ...(level !== null && { level }), // level이 null이 아닐 경우에만 추가
        deleted_at: null,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      totalCount, // 전체 질문 수
      questions, // 현재 페이지의 질문 목록
    };
  }

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
    return await this.prisma.$transaction(async (prisma) => {
      // 문제 확인
      const question = await prisma.gameQuestion.findUnique({
        where: { question_id: submitAnswerDto.questionId },
      });

      console.log('questionInfo ', question);
      if (!question) {
        throw new NotFoundException('문제를 찾을 수 없습니다.');
      }

      const isCorrect = question.answer === submitAnswerDto.answer;
      console.log('isCorrect_1 ', isCorrect);
      let experienceGained = 0;
      let levelCompleted = false;
      let gameLeveledUp = false;
      let userLeveledUp = false;
      let totalExperienceGained = 0;
      let finalExperience = 0;

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
          question_id: submitAnswerDto.questionId,
          answer: submitAnswerDto.answer,
          is_correct: isCorrect,
          session_id: submitAnswerDto.sessionId,
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
      const currentGameLevel = question.level;
      let currentExperience = user.experience_points;

      console.log('isCorrect_2 ', isCorrect);
      if (isCorrect) {
        console.log('isCorrect_3', isCorrect);
        console.log('gameTypeId', gameTypeId);
        console.log('currentGameLevel', currentGameLevel);
        console.log('currentUserLevel', currentUserLevel);
        // 현재 레벨의 모든 문제를 풀었는지 확인
        const [currentLevelQuestions, currentLevelCorrectAnswers] =
          await Promise.all([
            prisma.gameQuestion.count({
              where: {
                game_type_id: gameTypeId,
                level: currentGameLevel,
                deleted_at: null,
              },
            }),
            prisma.imageMatchingAnswer.count({
              where: {
                user_id: userId,
                is_correct: true,
                session_id: submitAnswerDto.sessionId,
                gameQuestion: {
                  game_type_id: gameTypeId,
                  level: currentGameLevel,
                },
              },
            }),
          ]);
        console.log('currentLevelQuestions', currentLevelQuestions);
        console.log('currentLevelCorrectAnswers', currentLevelCorrectAnswers);

        // 레벨의 모든 문제를 맞췄는지 확인
        levelCompleted = currentLevelQuestions === currentLevelCorrectAnswers;
        console.log('levelCompleted_0', levelCompleted);

        if (levelCompleted) {
          console.log('levelCompleted_1', levelCompleted);
          console.log('currentUserLevel', currentUserLevel);
          experienceGained = 10 * currentUserLevel; // 레벨이 높을수록 더 많은 경험치
          totalExperienceGained = experienceGained;
          finalExperience = currentExperience + experienceGained;
          console.log('experienceGained_1', experienceGained);
          console.log('currentExperience_1', currentExperience);

          // 게임의 최대 레벨 확인
          const maxGameLevel = await prisma.gameQuestion.groupBy({
            by: ['level'],
            where: {
              game_type_id: gameTypeId,
              deleted_at: null,
            },
            orderBy: {
              level: 'desc',
            },
            take: 1,
          });

          const maxAvailableLevel = maxGameLevel[0]?.level || 1;
          const nextLevel = (previousProgress?.current_level || 1) + 1;

          // 다음 레벨이 최대 레벨을 초과하지 않을 때만 레벨업
          // 다음 레벨이 최대 레벨을 초과하지 않을 때만 레벨업
          if (nextLevel <= maxAvailableLevel) {
            experienceGained = 10 * previousLevel;
            totalExperienceGained = experienceGained;
            finalExperience = currentExperience + experienceGained;

            console.log('experienceGained_2', experienceGained);
            console.log('currentExperience_2', currentExperience);

            // 게임 레벨 업데이트
            await prisma.userGameProgress.update({
              where: {
                user_id_game_type_id: {
                  user_id: userId,
                  game_type_id: gameTypeId,
                },
              },
              data: {
                // 현재 진행중인 레벨의 게임을 클리어했을 때만 다음 레벨로 업데이트
                ...(currentGameLevel === previousProgress?.current_level && {
                  current_level: nextLevel,
                  max_level: Math.max(
                    nextLevel,
                    previousProgress?.max_level || 1,
                  ),
                }),
                total_correct: { increment: 1 },
                total_attempts: { increment: 1 },
                last_played_at: new Date(),
              },
            });

            gameLeveledUp =
              currentGameLevel === previousProgress?.current_level;
          } else {
            // 최대 레벨에 도달한 경우
            experienceGained = 10 * previousLevel;
            totalExperienceGained = experienceGained;
            finalExperience = currentExperience + experienceGained;

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

            levelCompleted =
              currentGameLevel === previousProgress?.current_level;
          }

          console.log('experienceGained_4', experienceGained);
          console.log('currentExperience_4', currentExperience);

          console.log('currentExperience 경험치 업데이트 ', currentExperience);
          // 경험치 업데이트
          const updatedUser = await prisma.users.update({
            where: { user_id: userId },
            data: {
              experience_points: finalExperience,
            },
          });
          console.log('updatedUser', updatedUser);

          // 레벨업 체크 및 처리
          const levelUpResult =
            await this.levelThresholdService.checkAndProcessLevelUp(
              userId,
              prisma,
            );

          console.log('levelUpResult', levelUpResult);
          if (levelUpResult.leveledUp) {
            userLeveledUp = true;
            currentUserLevel = levelUpResult.newLevel;
            currentExperience = levelUpResult.experienceRemaining;
          }

          console.log('Final values:', {
            experienceGained: totalExperienceGained,
            currentExperience,
            finalExperience,
            previousUserLevel,
            currentUserLevel,
            userLeveledUp,
          });
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
          experienceGained: totalExperienceGained,
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
