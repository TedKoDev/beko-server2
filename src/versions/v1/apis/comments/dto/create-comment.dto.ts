// src/comments/dto/create-comment.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateMediaDto } from '../../media/dto/create-media.dto';

export class CreateCommentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  postId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  schoolId?: number;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  parentCommentId?: number;

  @ApiProperty({ required: false, type: [CreateMediaDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateMediaDto)
  media?: CreateMediaDto[];
}
