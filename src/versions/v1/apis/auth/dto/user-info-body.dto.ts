import { IsNotEmpty, IsString } from 'class-validator';

export class GetUserInfoBodyDto {
  @IsString()
  @IsNotEmpty()
  access_token: string;
}
