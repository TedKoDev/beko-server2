import { IsInt, IsPositive } from 'class-validator';

export class CreateOrUpdateLevelThresholdDto {
  @IsInt()
  @IsPositive()
  level: number;

  @IsInt()
  @IsPositive()
  min_experience: number;
}
