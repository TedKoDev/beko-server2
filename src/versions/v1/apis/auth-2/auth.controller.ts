import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

import * as config from 'config';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    await this.authService.registerUser(email, password, name);
    return {
      message:
        'User registered. Please check your email for verification link.',
    };
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('redirect_uri') redirectUri: string,
    @Body('state') state: string,
    @Res() res,
  ) {
    const result = await this.authService.loginUser(email, password);
    console.log('result', result);
    if (!result) {
      return res.status(401).send('Invalid credentials');
    }
    console.log(redirectUri);
    const redirectUrl = `${redirectUri}?code=${result.authCode}&state=${state}`;
    console.log(redirectUrl);
    res.redirect(redirectUrl);
  }

  @Get('confirm')
  async confirmEmail(@Query('token') token: string, @Res() res) {
    await this.authService.confirmEmail(token);
    return res.send('Email confirmed');
  }

  @Get('authorize')
  async authorize(
    @Query('response_type') responseType: string,
    @Query('client_id') clientId: string,
    @Query('redirect_uri') redirectUri: string,
    @Query('state') state: string,
    @Res() res,
  ) {
    if (responseType !== 'code' || clientId !== config.get('cafe24.clientId')) {
      return res.status(400).send('Invalid request');
    }

    // Render login page
    res.render('login', { clientId, redirectUri, state });
  }

  @Post('token')
  async getToken(
    @Body('grant_type') grantType: string,
    @Body('client_id') clientId: string,
    @Body('client_secret') clientSecret: string,
    @Body('code') authCode: string,
  ) {
    console.log(grantType, clientId, clientSecret, authCode);
    if (grantType !== 'authorization_code') {
      throw new Error('Unsupported grant type');
    }

    // Client ID 및 Client Secret 확인
    if (
      clientId !== config.get('cafe24.clientId') ||
      clientSecret !== config.get('cafe24.secret')
    ) {
      throw new Error('Invalid client credentials');
    }

    return this.authService.getToken(authCode);
  }

  @Get('user-info')
  @UseGuards(AuthGuard('jwt'))
  async getUserInfo(@Req() req) {
    return this.authService.getUserInfo(req.user.userId);
  }

  @Get('user-info-body')
  async getUserInfoBody(@Body('access_token') accessToken: string) {
    console.log(accessToken);
    return this.authService.getUserInfoBody(accessToken);
  }
}
