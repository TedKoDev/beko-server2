import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import * as config from 'config';
import { Response } from 'express';

import { EMAIL_SERVICE_TOKEN, EmailService } from '../email';
import { AUTH_SERVICE_TOKEN, AuthService } from './auth.service';
import {
  AuthorizeDto,
  ConfirmEmailDto,
  GetTokenDto,
  GetUserInfoBodyDto,
  KeojakGetTokenDto,
  LoginUserDto,
  RegisterUserDto,
} from './dto';
import { ApiKeyGuard } from './guards';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE_TOKEN)
    private readonly authService: AuthService,
    @Inject(EMAIL_SERVICE_TOKEN)
    private readonly emailService: EmailService,
  ) {}

  /** GET */
  @Get('confirm')
  async confirmEmail(
    @Query() { token }: ConfirmEmailDto,
    @Res() res: Response,
  ) {
    await this.authService.confirmEmail(token);
    return res.send('Email confirmed');
  }

  @Get('authorize')
  async authorize(
    @Query() { client_id, redirect_uri, response_type, state }: AuthorizeDto,
    @Res() res: Response,
  ) {
    if (
      response_type !== 'code' ||
      client_id !== config.get('cafe24.clientId')
    ) {
      return res.status(400).send('Invalid request');
    }

    res.render('login', {
      clientId: client_id,
      redirectUri: redirect_uri,
      state,
    });
  }

  /** POST */
  @Post('register')
  async register(@Body() { email, name, password }: RegisterUserDto) {
    await this.authService.registerUser(email, password, name);
    return {
      message:
        'User registered. Please check your email for verification link.',
    };
  }

  @Post('login')
  async login(
    @Body() { email, password, redirect_uri, state }: LoginUserDto,
    @Res() res: Response,
  ) {
    const result = await this.authService.loginUser(email, password);

    if (!result) {
      return res.status(401).send('Invalid credentials');
    }

    const redirectUrl = `${redirect_uri}?code=${result.authCode}&state=${state}&keojak_code=${result.keojakCode}`;
    res.redirect(redirectUrl);
  }

  @Post('token')
  async getToken(
    @Body() { code, client_id, client_secret, grant_type }: GetTokenDto,
  ) {
    if (grant_type !== 'authorization_code') {
      throw new Error('Unsupported grant type');
    }

    const innerClientId = config.get<string>('cafe24.clientId');
    const innerClientSecret = config.get<string>('cafe24.secret');
    if (client_id !== innerClientId || client_secret !== innerClientSecret) {
      throw new Error('Invalid client credentials');
    }

    return this.authService.getToken(code);
  }

  @Post('keojak-token')
  @UseGuards(ApiKeyGuard)
  async getKeojakToken(@Body() { keojakCode }: KeojakGetTokenDto) {
    return this.authService.getKeojakToken(keojakCode);
  }

  @Post('user-info-body')
  async getUserInfoBody(@Body() { access_token }: GetUserInfoBodyDto) {
    return this.authService.getUserInfoBody(access_token);
  }

  @Post('social-login')
  async socialLogin() {
    // return this.authService.findOrCreateUserFromSocialLogin()
  }
}
