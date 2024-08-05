// src/posts/dto/create-post.dto.ts
import { PostType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateMediaDto } from '../../media/dto';

export class CreatePostDto {
  @IsNumber()
  categoryId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  type: PostType; // 타입은 enum으로 지정

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => CreateMediaDto)
  media: CreateMediaDto[];

  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
}
