import { PartialType } from '@nestjs/mapped-types';
import { ServiceName } from '../../../../../types/v1';
import { InquiryDto } from './inquiry.dto';

export class CreateInquiryDto extends PartialType(InquiryDto) {
  readonly name: string;
  readonly email: string;
  readonly message: string;
  readonly serviceType: ServiceName;
  readonly inquiryType: string;
  readonly additionalConsent?: boolean;
  readonly phone?: string;
}
