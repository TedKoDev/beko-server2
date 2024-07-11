import { PartialType } from '@nestjs/mapped-types';
import { GeneralInquiryDto } from './general-inquiry.dto';

export class CreateGeneralInquiryDto extends PartialType(GeneralInquiryDto) {
  readonly name: string;
  readonly email: string;
  readonly inquiryType: string;
  readonly message: string;
  readonly answered: boolean;
}
