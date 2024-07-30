import { IsNotEmpty, IsString } from 'class-validator';

export class KeojakGetTokenDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
