import { Provider } from '@nestjs/common';

import { USER_SERVIE_TOKEN, UserService } from './user.service';

export const UserProvider: Provider = {
  provide: USER_SERVIE_TOKEN,
  useClass: UserService,
};
