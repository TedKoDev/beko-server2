// src/comments/dto/create-comment.dto.ts
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateMediaDto } from '../../media/dto/create-media.dto';

export class CreateCommentDto {
  @IsInt()
  postId: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsInt()
  @IsOptional()
  parentCommentId?: number;

  @IsOptional()
  @IsInt()
  likes?: number;

  @IsOptional()
  media?: CreateMediaDto[];
}
