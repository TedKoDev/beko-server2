import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class SubmitAnswerDto {
  @ApiProperty({ description: '문제 ID' })
  @IsNumber()
  questionId: number;

  @ApiProperty({ description: '제출한 답안' })
  @IsString()
  answer: string;
}
