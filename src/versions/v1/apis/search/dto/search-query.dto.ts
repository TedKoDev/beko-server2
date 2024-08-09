// src/search/dto/search-query.dto.ts
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SearchQueryDto {
  @IsString()
  query: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  limit: number = 10;
}
