import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    description: 'Page number (starts from 1)',
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    default: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({
    description: 'Country code filter (ISO 3166-1 alpha-2)',
    required: false,
    example: 'KR',
  })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  country_code?: string;

  @ApiProperty({
    description: 'Description filter',
    required: false,
    example: 'This School is good',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Region filter',
    required: false,
    example: 'Seoul',
  })
  @IsOptional()
  @IsString()
  region?: string;
}
