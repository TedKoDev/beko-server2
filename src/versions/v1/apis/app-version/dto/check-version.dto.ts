import { IsIn, IsNumber, IsString } from 'class-validator';

export class CheckVersionDto {
  @IsString()
  @IsIn(['ios', 'android'])
  platform: string;

  @IsString()
  version: string;

  @IsNumber()
  build: number;
}
