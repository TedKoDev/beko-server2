import { Transform } from 'class-transformer';
import { IsInt, IsNumber, IsOptional } from 'class-validator';

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

  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    return Number(value);
  })
  @IsNumber()
  @IsOptional()
  userId?: number | null;
}
