import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsNumber()
  @IsNotEmpty()
  country_id: number;

  @IsBoolean()
  @IsNotEmpty()
  term_agreement: boolean;

  @IsBoolean()
  @IsNotEmpty()
  privacy_agreement: boolean;

  @IsBoolean()
  @IsNotEmpty()
  marketing_agreement: boolean;
}
