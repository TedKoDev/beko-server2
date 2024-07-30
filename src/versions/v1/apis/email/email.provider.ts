import { Provider } from '@nestjs/common';
import { EMAIL_SERVICE_TOKEN, EmailService } from './email.service';

export const EmailProvider: Provider = {
  provide: EMAIL_SERVICE_TOKEN,
  useClass: EmailService,
};
