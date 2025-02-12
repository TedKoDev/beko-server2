import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateVectorDocumentDto {
  @ApiProperty({
    description: '문서 제목',
    example: '서울대 어학당 수강료',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: '문서 내용',
    example: '2024년 서울대학교 어학당 수강료는 ...',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;
}
