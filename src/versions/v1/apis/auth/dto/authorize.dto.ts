import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class AuthorizeDto {
  @IsString()
  @IsNotEmpty()
  response_type: string;

  @IsString()
  @IsNotEmpty()
  client_id: string;

  @IsUrl()
  @IsNotEmpty()
  redirect_uri: string;

  @IsString()
  @IsNotEmpty()
  state: string;
}
