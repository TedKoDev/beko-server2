import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiOperation } from '@nestjs/swagger';
import { social_provider } from '@prisma/client';
import { Request, Response } from 'express';
import { SlackService } from '../utils/slack/slack.service';
import { AUTH_SERVICE_TOKEN, AuthService } from './auth.service';
import {
  ConfirmEmailDto,
  DevLoginDto,
  ForgotPasswordDto,
  GetUserInfoBodyDto,
  RegisterUserDto,
  ResendVerificationDto,
  ResetPasswordDto,
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
    return res.send('Email verification completed. Please login.');
  }

  /** POST */
  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    const {
      email,
      name,
      password,
      country_id,
      term_agreement,
      privacy_agreement,
      marketing_agreement,
    } = dto;
    console.log('country_id', country_id);
    const result = await this.authService.registerUser(
      email,
      password,
      name,
      country_id,
      term_agreement,
      privacy_agreement,
      marketing_agreement,
    );

    await this.slackService.sendMessage(
      '#알림봇테스트',
      `New user registered: ${name} (${email})`,
    );

    return result;
  }

  // @Post('login')
  // async Login(@Body() dto: DevLoginDto) {
  //   const { email, password } = dto;
  //   return this.authService.loginUser(email, password);
  // }
  @Post('login')
  async Login(
    @Body() dto: DevLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { email, password } = dto;
    const tokens = await this.authService.loginUser(email, password);

    // Set refresh token in HTTP-only cookie
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return access token in response body
    return {
      access_token: tokens.access_token,
      user: tokens.user,
    };
  }

  @Post('refresh')
  async refresh(@Req() req: Request) {
    const refresh_token = req.cookies['refresh_token'];
    if (!refresh_token) {
      throw new UnauthorizedException('Refresh token not found');
    }
    return this.authService.refreshTokens(refresh_token);
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
    @Res({ passthrough: true }) res: Response,
  ) {
    const { provider, providerUserId, email, name } = dto;
    const user = await this.authService.validateSocialUser(
      provider,
      providerUserId,
      email,
      name,
    );

    // 일반 로그인과 동일한 토큰 생성 로직 사용
    const tokens = await this.authService.generateTokens(user);

    // Store refresh token hash in database
    await this.authService.updateRefreshToken(
      user.user_id,
      tokens.refresh_token,
    );

    // Set refresh token in HTTP-only cookie
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return access token and user info
    return {
      access_token: tokens.access_token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
      },
    };
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.new_password);
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend verification email' })
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerificationEmail(dto.email);
  }
}
