import { PostStatus, PostType } from '@prisma/client'; // 필요한 경우 enum을 정의하거나 임포트하세요
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreatePostDto {
  @IsInt()
  user_id: number;

  @IsInt()
  category_id: number;

  @IsString()
  @Length(1, 255)
  title: string;

  @IsString()
  content: string;

  @IsEnum(PostType)
  type: PostType;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsInt()
  views?: number;

  @IsOptional()
  @IsInt()
  likes?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  created_at?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updated_at?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deleted_at?: Date;
}
