// src/media/dto/create-media.dto.ts
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMediaDto {
  @IsString()
  @IsNotEmpty()
  mediaUrl: string;

  @IsEnum(['IMAGE', 'VIDEO'])
  @IsNotEmpty()
  mediaType: 'IMAGE' | 'VIDEO';

  @IsNumber()
  @IsOptional()
  postId?: number;

  @IsNumber()
  @IsOptional()
  commentId?: number;
}
