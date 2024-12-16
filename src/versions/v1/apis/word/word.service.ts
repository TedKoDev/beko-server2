import { PrismaService } from '@/prisma/postsql-prisma.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as cron from 'node-cron';

@Injectable()
export class WordService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // 서버 시작시 오늘의 단어가 없다면 선택
    const todayWords = await this.getWords();
    if (todayWords.length === 0) {
      console.log('No words found for today, selecting new words...');
      await this.selectDailyWords();
    }

    // 매일 자정(한국 시간)에 실행 - 매분 체크용 로그 추가
    cron.schedule(
      '0 0 * * *',
      async () => {
        console.log(
          'Cron job triggered at midnight KST:',
          new Date().toISOString(),
        );
        await this.selectDailyWords();
      },
      {
        scheduled: true,
        timezone: 'Asia/Seoul',
      },
    );

    // 크론잡이 제대로 등록되었는지 확인
    console.log('Cron job scheduled for midnight KST');
  }

  private async selectDailyWords() {
    try {
      console.log('Starting daily word selection:', new Date().toISOString());

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 트랜잭션으로 처리
      await this.prisma.$transaction(async (tx) => {
        // 기존 선택된 단어들 삭제
        await tx.selected_words.deleteMany({
          where: {
            selected_date: today,
          },
        });

        // 새로운 단어 선택
        const randomWords = await tx.$queryRaw<Array<{ word_id: number }>>`
          SELECT word_id 
          FROM wordlist 
          WHERE deleted_at IS NULL 
          ORDER BY usage_count ASC, RANDOM() 
          LIMIT 3`;

        // 선택된 단어들 저장
        for (const word of randomWords) {
          await tx.selected_words.create({
            data: {
              word_id: word.word_id,
              selected_date: today,
            },
          });

          await tx.wordlist.update({
            where: { word_id: word.word_id },
            data: {
              usage_count: { increment: 1 },
              updated_at: new Date(),
            },
          });
        }
      });

      console.log('Daily word selection completed successfully');
    } catch (error) {
      console.error('Daily word selection failed:', error);
      throw error; // 에러를 다시 던져서 상위에서 처리할 수 있도록 함
    }
  }

  async getWords() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정

      const todaysWords = await this.prisma.selected_words.findMany({
        where: {
          selected_date: today,
        },
        include: {
          word: true,
        },
      });

      return todaysWords.map(({ word }) => ({
        word_id: word.word_id,
        word: word.word,
        meaning_en: word.meaning_en,
        example_sentence: word.example_sentence,
        example_translation: word.example_translation,
        part_of_speech: word.part_of_speech,
        usage_count: word.usage_count,
      }));
    } catch (error) {
      console.error("Failed to fetch today's words:", error);
      return [];
    }
  }

  // 1. 단어 리스트 조회 (페이징 처리 포함)
  async getWordList(userId: number, page: number = 1, limit: number = 20) {
    // 전체 수량
    const totalCount = await this.prisma.wordlist.count({
      where: {
        deleted_at: null,
      },
    });

    // 단어 리스트 조회와 함께 해당 유저의 단어장 정보도 함께 가져오기
    const wordList = await this.prisma.wordlist.findMany({
      where: {
        deleted_at: null,
      },
      // 유저단어장 정보 포함
      include: {
        user_word: {
          // 유저단어장 조회
          where: {
            // 유저단어장 조회
            user_id: userId,
            // 삭제되지 않은 단어장만 조회
            deleted_at: null,
          },
          // 메모와 추가된 날짜만 조회
          select: {
            // 메모만 조회
            notes: true,
            // 추가된 날짜만 조회
            created_at: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        created_at: 'desc',
      },
    });

    // 응답 데이터 가공
    const formattedWordList = wordList.map((word) => ({
      ...word, // 원본 단어 데이터
      isInUserWordList: word.user_word.length > 0, // 유저단어장에 있는지 여부
      userNotes: word.user_word[0]?.notes || null, // 유저단어장에 있는 단어의 메모
      addedToUserWordListAt: word.user_word[0]?.created_at || null, // 유저단어장에 추가된 날짜
      user_word: undefined, // 원본 user_word 배열은 제거
    }));
    console.log('formattedWordList', formattedWordList);
    return {
      wordList: formattedWordList,
      totalCount,
    };
  }
  // 2. 유저 단어장에 단어 저장
  async addToUserWordList(userId: number, wordId: number, notes?: string) {
    try {
      // 이미 존재하는지 확인
      const existingWord = await this.prisma.user_word.findUnique({
        where: {
          user_id_word_id: {
            user_id: userId,
            word_id: wordId,
          },
        },
      });

      if (existingWord) {
        // 이미 존재하면 토글 (삭제 상태면 복구, 활성 상태면 삭제)
        return this.prisma.user_word.update({
          where: {
            user_id_word_id: {
              user_id: userId,
              word_id: wordId,
            },
          },
          data: {
            deleted_at: existingWord.deleted_at ? null : new Date(),
            notes: existingWord.deleted_at ? notes : existingWord.notes,
          },
        });
      }

      // 존재하지 않으면 새로 추가
      return this.prisma.user_word.create({
        data: {
          user_id: userId,
          word_id: wordId,
          notes,
        },
      });
    } catch (error) {
      console.error('addToUserWordList error:', error);
      throw error;
    }
  }
  async updateUserWord(userId: number, wordId: number, notes?: string) {
    return this.prisma.user_word.update({
      where: { user_id_word_id: { user_id: userId, word_id: wordId } },
      data: { notes },
    });
  }

  // 2-1. 유저 단어장 메모 업데이트
  async updateUserWordNotes(userId: number, wordId: number, notes?: string) {
    return this.prisma.user_word.update({
      where: { user_id_word_id: { user_id: userId, word_id: wordId } },
      data: { notes },
    });
  }

  // 3. 새로운 단어 추가 및 유저 단어장에 저장
  async createNewWord(
    userId: number,
    wordData: {
      word: string;
      part_of_speech: string;
      meaning_en: string;
      example_sentence?: string;
      example_translation?: string;
      notes?: string;
    },
  ) {
    // 트랜잭션으로 처리
    return this.prisma.$transaction(async (tx) => {
      // 1. wordlist에 단어 추가
      const newWord = await tx.wordlist.create({
        data: {
          word: wordData.word,
          part_of_speech: wordData.part_of_speech,
          meaning_en: wordData.meaning_en,
          example_sentence: wordData.example_sentence,
          example_translation: wordData.example_translation,
        },
      });

      // 2. 유저 단어장에 추가
      const userWord = await tx.user_word.create({
        data: {
          user_id: userId,
          word_id: newWord.word_id,
          notes: wordData.notes,
        },
      });

      return {
        word: newWord,
        userWord,
      };
    });
  }

  // 유저의 단어장 조회
  async getUserWordList(userId: number, page: number = 1, limit: number = 20) {
    return this.prisma.user_word.findMany({
      where: {
        user_id: userId,
        deleted_at: null,
      },
      include: {
        word: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  // 유저 단어장에서 단어 삭제
  async removeFromUserWordList(userId: number, wordId: number) {
    return this.prisma.user_word.update({
      where: {
        user_id_word_id: {
          user_id: userId,
          word_id: wordId,
        },
      },
      data: {
        deleted_at: new Date(),
      },
    });
  }

  // 단어 검색
  async searchWords(keyword: string, page: number = 1, limit: number = 20) {
    return this.prisma.wordlist.findMany({
      where: {
        OR: [
          { word: { contains: keyword, mode: 'insensitive' } },
          { meaning_en: { contains: keyword, mode: 'insensitive' } },
        ],
        deleted_at: null,
      },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}
