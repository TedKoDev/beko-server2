// src/points/dto/create-point.dto.ts
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePointDto {
  @IsInt()
  pointsChange: number;

  @IsString()
  @IsOptional()
  changeReason?: string;
}
