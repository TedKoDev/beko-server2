import { IsInt, IsOptional } from 'class-validator';

export class GetImageGameQuestionDto {
  @IsInt()
  gameTypeId: number;

  @IsOptional()
  @IsInt()
  level: number | null;

  @IsInt()
  page: number;

  @IsInt()
  limit: number;
}
