// update-user-profile.dto.ts
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateUserProfileDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  profile_picture_url?: string;

  // 국가
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  country_id: number;
  //terms_agreed
  @IsBoolean()
  @IsOptional()
  terms_agreed: boolean;

  //privacy_agreed
  @IsBoolean()
  @IsOptional()
  privacy_agreed: boolean;

  //marketing_agreed
  @IsBoolean()
  @IsOptional()
  marketing_agreed: boolean;
}
