import { IsNotEmpty, IsString } from 'class-validator';

export class GetTokenDto {
  @IsString()
  @IsNotEmpty()
  grantType: string;

  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  clientSecret: string;

  @IsString()
  @IsNotEmpty()
  authCode: string;
}
