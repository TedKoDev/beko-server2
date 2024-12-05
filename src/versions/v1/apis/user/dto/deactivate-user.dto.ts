import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class DeactivateUserDto {
  @ApiProperty({
    description: '계정 비활성화를 위한 비밀번호 확인',
    example: 'yourpassword123',
  })
  @IsString()
  @MinLength(3)
  password: string;
}
