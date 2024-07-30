import { IsNotEmpty, IsString } from 'class-validator';

export class GetTokenDto {
  @IsString()
  @IsNotEmpty()
  grant_type: string;

  @IsString()
  @IsNotEmpty()
  client_id: string;

  @IsString()
  @IsNotEmpty()
  client_secret: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  refresh_token: string

  @IsString()
  redirect_uri: string
}
