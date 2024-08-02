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

import { Auth } from '@/decorators';
import { JwtService } from '@nestjs/jwt';
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
    private readonly jwtService: JwtService,
  ) {}

  /** GET */
  @Get('confirm')
  async confirmEmail(@Query() dto: ConfirmEmailDto, @Res() res: Response) {
    const { token } = dto;
    await this.authService.confirmEmail(token);
    return res.send('Email confirmed');
  }

  @Get('authorize')
  @Auth(['ANY'])
  async authorize(@Query() dto: AuthorizeDto, @Res() res: Response) {
    const { client_id, redirect_uri, response_type, state } = dto;
    const cafe24ClientId = config.get<string>('cafe24.clientId');
    const isInvalidRequest =
      response_type !== 'code' || client_id !== cafe24ClientId;
    if (isInvalidRequest) {
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
  async register(@Body() dto: RegisterUserDto) {
    const { email, name, password } = dto;
    await this.authService.registerUser(email, password, name);
    const message =
      'User registered. Please check your email for verification link.';
    return { message };
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto, @Res() res: Response) {
    const { email, password, redirect_uri, state } = dto;
    const result = await this.authService.loginUser(email, password);
    if (!result) {
      return res.status(401).send('Invalid credentials');
    }

    const redirectUrl = `${redirect_uri}?code=${result.authCode}&state=${state}&keojak_code=${result.keojakCode}`;
    res.redirect(redirectUrl);
  }

  @Post('token')
  async getToken(@Body() dto: GetTokenDto) {
    const { code, client_id, client_secret, grant_type } = dto;
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
  async getUserInfoBody(@Body() dto: GetUserInfoBodyDto) {
    const { access_token } = dto;
    const payload = this.jwtService.verify(access_token);
    return this.authService.getUserInfoBody(payload.userId);
  }
}
