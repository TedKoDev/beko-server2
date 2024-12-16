import { IsArray, IsInt, IsString } from 'class-validator';

export class AddImageGameQuestionDto {
  @IsInt()
  game_type_id: number;

  @IsString()
  image_url: string;

  @IsString()
  answer: string;

  @IsInt()
  level: number;

  @IsArray()
  options: string[];
}

// 게임 이미지/문제 통합 모델
// model GameQuestion {
//   question_id   Int       @id @default(autoincrement())
//   game_type_id  Int
//   image_url     String    @unique @db.VarChar(255)
//   answer        String    @db.VarChar(100)
//   options       String[]  // 배열 타입 사용
//   level         Int
//   created_at    DateTime  @default(now()) @db.Timestamp
//   updated_at    DateTime? @db.Timestamp
//   deleted_at    DateTime? @db.Timestamp

//   gameType      GameType  @relation(fields: [game_type_id], references: [game_type_id])
//   matchingAnswers ImageMatchingAnswer[]

//   @@index([level])
//   @@index([game_type_id])
// }
