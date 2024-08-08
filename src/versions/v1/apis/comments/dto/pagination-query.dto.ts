import { IsInt, IsOptional } from 'class-validator';

export class PaginationQueryDto {
  @IsInt()
  @IsOptional()
  page?: number;

  @IsInt()
  @IsOptional()
  limit?: number;

  @IsOptional()
  sort?: 'latest' | 'oldest' | 'popular';

  @IsInt()
  @IsOptional()
  postId?: number;
}
