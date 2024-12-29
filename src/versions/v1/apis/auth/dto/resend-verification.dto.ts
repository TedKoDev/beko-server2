import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendVerificationDto {
  @ApiProperty({
    example: 'user@example.com',
    description: '인증 이메일을 재전송할 이메일 주소',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
