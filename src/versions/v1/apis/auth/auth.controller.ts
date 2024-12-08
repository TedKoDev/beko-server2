import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { social_provider } from '@prisma/client';

import { Response } from 'express';
import { SlackService } from '../utils/slack/slack.service';
import { AUTH_SERVICE_TOKEN, AuthService } from './auth.service';
import {
  ConfirmEmailDto,
  DevLoginDto,
  GetUserInfoBodyDto,
  RegisterUserDto,
} from './dto';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE_TOKEN)
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly slackService: SlackService,
  ) {}

  /** GET */
  @Get('confirm')
  async confirmEmail(@Query() dto: ConfirmEmailDto, @Res() res: Response) {
    const { token } = dto;
    await this.authService.confirmEmail(token);
    return res.send('이메일 인증이 완료되었습니다. 로그인해주세요.');
  }

  /** POST */
  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    const { email, name, password, country_id } = dto;
    console.log('country_id', country_id);
    const result = await this.authService.registerUser(
      email,
      password,
      name,
      country_id,
    );

    await this.slackService.sendMessage(
      '#알림봇테스트',
      `New user registered: ${name} (${email})`,
    );

    return result;
  }

  @Post('login')
  async Login(@Body() dto: DevLoginDto) {
    const { email, password } = dto;
    return this.authService.loginUser(email, password);
  }

  @Post('user-info-body')
  async getUserInfoBody(@Body() dto: GetUserInfoBodyDto) {
    const { access_token } = dto;
    const payload = this.jwtService.verify(access_token);
    return this.authService.getUserInfoBody(payload.userId);
  }

  @Post('check-email')
  async checkEmail(@Body('email') email: string) {
    return this.authService.checkEmail(email);
  }

  @Post('check-name')
  async checkName(@Body('name') name: string) {
    return this.authService.checkName(name);
  }

  @Post('social-login')
  async socialLogin(
    @Body()
    dto: {
      provider: social_provider;
      providerUserId: string;
      email: string;
      name?: string;
    },
  ) {
    const { provider, providerUserId, email, name } = dto;
    const user = await this.authService.validateSocialUser(
      provider,
      providerUserId,
      email,
      name,
    );

    // JWT 토큰 생성
    const payload = { userId: user.user_id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1w' });

    return {
      access_token: accessToken,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
      },
    };
  }
}
