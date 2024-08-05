// src/versions/v1/apis/posts/dto/update-post.dto.ts
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { UpdateMediaDto } from '../../media/dto/update-media.dto';

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @ValidateNested({ each: true })
  @Type(() => UpdateMediaDto)
  @IsOptional()
  media?: UpdateMediaDto[];
}
