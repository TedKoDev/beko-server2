import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { ServiceName } from '../../../../../types/v1';

export class InquiryDto {
  @ApiProperty({ description: 'name', required: true })
  @IsString()
  @IsOptional()
  readonly name: string;

  @ApiProperty({ description: 'email', required: true })
  @IsEmail()
  readonly email: string;

  @ApiProperty({ description: 'message', required: true })
  @IsString()
  readonly message: string;

  @ApiProperty({ description: 'serviceType', required: true })
  @IsEnum(ServiceName)
  readonly serviceType: ServiceName;

  @ApiProperty({ description: 'inquiryType', required: true })
  @IsString()
  readonly inquiryType: string;

  @ApiProperty({ description: 'additionalConsent', required: false })
  @IsBoolean()
  @IsOptional()
  readonly additionalConsent?: boolean;

  @ApiProperty({ description: 'phone', required: false })
  @IsString()
  @IsOptional()
  readonly phone?: string;
}
