import { Controller, Get, Inject, Req } from '@nestjs/common';

import { Auth } from '@/decorators';
import { ROLE } from '@/types/v1';
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

  @Get('/profile')
  @Auth(['SUPER_ADMIN', 'USER'])
  async profile(@Req() req: { user: { userId: string, role: ROLE }}) {
    return this.userService.profile(req.user.userId)
  }
}
