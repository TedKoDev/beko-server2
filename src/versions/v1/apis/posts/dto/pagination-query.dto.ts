// src/posts/dto/pagination-query.dto.ts

import { PostType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional } from 'class-validator';

export class PaginationQueryDto {
  @IsInt()
  @IsOptional()
  page?: number;

  @IsInt()
  @IsOptional()
  limit?: number;

  @IsEnum(PostType)
  @IsOptional()
  type?: PostType;

  @IsOptional()
  sort?: 'latest' | 'oldest' | 'popular';
}
