import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsString } from 'class-validator';

export class CheckVersionDto {
  @IsString()
  @IsIn(['ios', 'android'])
  platform: string;

  @IsString()
  version: string;

  @Type(() => Number) // 쿼리 스트링을 숫자로 변환
  @IsNumber()
  build: number;
}
