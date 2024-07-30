import { Provider } from '@nestjs/common';
import { AUTH_SERVICE_TOKEN, AuthService } from './auth.service';

export const AuthProvider: Provider = {
  provide: AUTH_SERVICE_TOKEN,
  useClass: AuthService,
};
