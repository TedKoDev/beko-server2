// src/points/dto/pagination-query.dto.ts
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class PaginationQueryDto {
  @IsInt()
  @IsPositive()
  @IsOptional()
  page: number = 1;

  @IsInt()
  @IsPositive()
  @IsOptional()
  limit: number = 10;
}
