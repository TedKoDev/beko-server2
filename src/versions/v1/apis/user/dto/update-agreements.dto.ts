import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateAgreementsDto {
  @IsBoolean()
  @IsNotEmpty()
  terms_agreed: boolean;

  @IsBoolean()
  @IsNotEmpty()
  privacy_agreed: boolean;

  @IsBoolean()
  @IsNotEmpty()
  marketing_agreed: boolean;
}
