import { IsNotEmpty, IsString } from 'class-validator';

export class GetUserInfoBodyDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}
