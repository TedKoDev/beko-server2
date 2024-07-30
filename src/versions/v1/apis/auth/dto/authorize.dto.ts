import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class AuthorizeDto {
  @IsString()
  @IsNotEmpty()
  responseType: string;

  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsUrl()
  @IsNotEmpty()
  redirectUri: string;

  @IsString()
  @IsNotEmpty()
  state: string;
}
