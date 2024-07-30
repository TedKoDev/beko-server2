import { IsString } from "class-validator";

export class AuthorizeDto {
  @IsString()
  response_type: string;

  @IsString()
  client_id: string;

  @IsString()
  state: string;

  @IsString()
  redirect_uri: string;

  @IsString()
  sso_code: string;
}
