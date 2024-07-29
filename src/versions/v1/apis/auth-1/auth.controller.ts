import { Controller, Get, Post } from '@nestjs/common';

@Controller({
  path: 'auth-1',
  version: '1',
})
export class AuthController {
  constructor() {}

  @Post()
  async register() {
    return 'auth-1';
  }

  @Get('/profile')
  async profile() {
    return {
      id: '',
      name: 'John Doe',
      email: '',
    };
  }
}
