import { Provider } from '@nestjs/common';
import { INQUIRY_SERVICE_TOKEN, InquiryService } from './inquiry.service';

export const InquiryProvider: Provider = {
  provide: INQUIRY_SERVICE_TOKEN,
  useClass: InquiryService,
};
