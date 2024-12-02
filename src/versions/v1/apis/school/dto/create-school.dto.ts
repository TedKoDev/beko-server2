import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class CreateSchoolDto {
  @ApiProperty({
    example: 'KR',
    description: 'Country code (ISO 3166-1 alpha-2)',
  })
  @IsString()
  @Length(2, 2)
  country_code: string;

  @ApiProperty({
    example: 'Seoul',
    description: 'Region name',
  })
  @IsString()
  region: string;

  @ApiProperty({
    example: '서울대학교 언어교육원',
    description: 'School name in Korean',
  })
  @IsString()
  name_ko: string;

  @ApiProperty({
    example: 'Seoul National University Language Institute',
    description: 'School name in English',
  })
  @IsString()
  name_en: string;

  @ApiProperty({
    example: 'https://lei.snu.ac.kr',
    description: 'School website URL',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website_url?: string;
}
