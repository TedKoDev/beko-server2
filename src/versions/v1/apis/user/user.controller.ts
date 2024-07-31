import { Controller, Get, Inject } from '@nestjs/common';

import { Auth } from '@/decorators';
import { USER_SERVIE_TOKEN, UserService } from './user.service';

@Controller({
  path: 'user',
  version: '1',
})
export class UserController {
  constructor(
    @Inject(USER_SERVIE_TOKEN)
    private readonly userService: UserService,
  ) {}

  @Get('/')
  @Auth(['USER'])
  async profile(userId: string) {
    return this.userService.profile(userId);
  }
}
