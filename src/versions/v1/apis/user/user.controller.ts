import { Controller, Get, Inject, Req } from '@nestjs/common';

import { Auth } from '@/decorators';
import { ROLE } from '@/types/v1';
import { USER_SERVIE_TOKEN, UserService } from './user.service';

@Controller({
  path: 'users',
  version: '1',
})
export class UserController {
  constructor(
    @Inject(USER_SERVIE_TOKEN)
    private readonly userService: UserService,
  ) {}

  @Get('profile')
  @Auth(['ANY'])
  async profile(@Req() req: { user: { userId: number; role: ROLE } }) {
    console.log('hi');
    return this.userService.profile(req.user.userId);
  }
}
