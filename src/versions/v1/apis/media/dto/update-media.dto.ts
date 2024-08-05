// src/media/dto/update-media.dto.ts
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateMediaDto {
  @IsNumber()
  @IsOptional()
  media_id?: number;

  @IsString()
  @IsOptional()
  mediaUrl?: string;

  @IsEnum(['IMAGE', 'VIDEO'])
  @IsOptional()
  mediaType?: 'IMAGE' | 'VIDEO';

  @IsNumber()
  @IsOptional()
  postId?: number;

  @IsNumber()
  @IsOptional()
  commentId?: number;
}
