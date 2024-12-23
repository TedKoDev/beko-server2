import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateVersionDto {
  @IsString()
  @IsIn(['ios', 'android'])
  platform: string;

  @IsString()
  version: string;

  @IsNumber()
  build: number;

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsString()
  @IsOptional()
  message?: string;
}
