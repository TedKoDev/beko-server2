import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class GeneralInquiryDto {
  @ApiProperty({ description: 'name', required: true })
  @IsString()
  readonly name: string;

  @ApiProperty({ description: 'email', required: true })
  @IsEmail()
  readonly email: string;

  @ApiProperty({ description: 'inquiryType', required: true })
  @IsString()
  readonly inquiryType: string;

  @ApiProperty({ description: 'message', required: true })
  @IsString()
  readonly message: string;

  @ApiProperty({ description: 'answered', required: true })
  @IsBoolean()
  readonly answered: boolean;
}
