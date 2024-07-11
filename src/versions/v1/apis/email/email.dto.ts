import { IsEmail, IsString } from 'class-validator';

export class CreateEmailDto {
  @IsEmail()
  receiverEmail: string;

  @IsString()
  subject: string;

  @IsString()
  content: string;
}
