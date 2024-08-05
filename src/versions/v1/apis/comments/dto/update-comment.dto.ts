// src/comments/dto/update-comment.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UpdateMediaDto } from '../../media/dto/update-media.dto';

export class UpdateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  media?: UpdateMediaDto[];
}
