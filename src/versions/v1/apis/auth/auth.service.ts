import { MongoPrismaService } from '@/prisma';
import { ROLE } from '@/types/v1';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as config from 'config';
import { pbkdf2Sync } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export const AUTH_SERVICE_TOKEN = 'AUTH_SERVICE_TOKEN';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: MongoPrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // 회원가입
  async registerUser(email: string, password: string, name: string) {
    const emailVerificationToken = uuidv4();
    const encryptedPassword = this._encryptPassword(password);

    const data = await this.prisma.users.create({
      data: {
        email,
        encrypted_password: encryptedPassword,
        name,
        email_verification_token: emailVerificationToken,
        is_email_verified: false,
        role: ROLE.USER,
      },
    });

    return data;
  }

  // 로그인
  async loginUser(email: string, password: string) {
    const data = await this.prisma.users.findUnique({
      where: { email },
      select: { id: true, encrypted_password: true, is_email_verified: true },
    });

    if (data === null) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = this._comparePassword(
      password,
      data.encrypted_password,
    );

    if (!isPasswordValid) {
      throw new Error('Invalid credentials or email not verified');
    }

    const authCode = uuidv4();
    const keojakCode = uuidv4();
    await this.prisma.auth_code.create({
      data: { code: authCode, keojak_code: keojakCode, user_id: data.id },
    });

    return { authCode, keojakCode };
  }

  // 이메일 인증
  async confirmEmail(token: string) {
    const data = await this.prisma.users.updateMany({
      where: { email_verification_token: token },
      data: { is_email_verified: true },
    });

    return data;
  }

  // 유효한 사용자인지 확인
  async validateUser(email: string, password: string): Promise<any> {
    const data = await this.prisma.users.findUnique({ where: { email } });

    if (!data) {
      return null;
    }

    const user = data;

    const isPasswordValid = this._comparePassword(
      password,
      data.encrypted_password,
    );

    if (!isPasswordValid) {
      return null;
    }

    if (!user.is_email_verified) {
      throw new Error('Email not verified');
    }

    return user;
  }

  // 인증 코드 생성
  async generateAuthCode(user: any) {
    const authCode = uuidv4();
    const keojak_code = uuidv4();
    await this.prisma.auth_code.create({
      data: {
        code: authCode,
        user_id: user.id,
        keojak_code,
      },
    });

    return { authCode, keojak_code };
  }

  // 카페 24 인증 토큰 발급
  async getToken(authCode: string) {
    const data = await this.prisma.auth_code.findUnique({
      where: { code: authCode },
    });

    if (!data) {
      throw new Error('Invalid authorization code');
    }

    const payload = { userId: data.user_id };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '1m' }),
    };
  }

  // 커작 인증 토큰 발급
  async getKeojakToken(keojakCode: string) {
    const data = await this.prisma.auth_code.findUnique({
      where: { keojak_code: keojakCode },
    });

    if (!data) {
      throw new Error('Invalid authorization code');
    }

    const user = await this.prisma.users.findUnique({
      where: { id: data.user_id },
    });

    const payload = { userId: data.user_id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '1h' }),
    };
  }

  // 사용자 정보
  async getUserInfo(userId: string) {
    const data = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    if (!data) {
      throw new Error('User not found');
    }

    return data;
  }

  async findOrCreateUserFromSocialLogin({
    provider,
    providerUserId,
    name,
  }: {
    provider: string;
    providerUserId: string;
    email?: string;
    name?: string;
  }) {
    const socialLogin = await this.prisma.social_login.findFirst({
      where: {
        provider,
        providerUserId,
      },
      include: {
        user: true,
      },
    });

    if (socialLogin) {
      return socialLogin.user;
    }

    this.prisma.users.create({
      data: {
        encrypted_password: null,
        email: null,
        name,
        role: ROLE.USER,
        socialLogins: {
          create: {
            provider,
            providerUserId,
          },
        },
      },
    });
  }

  // 사용자 정보 가져오기
  async getUserInfoBody(accessToken: string) {
    const payload = this.jwtService.verify(accessToken);
    return this.getUserInfo(payload.userId);
  }

  // 비밀번호 일치 여부 확인
  _comparePassword(password: string, encryptedPassword: string) {
    return this._encryptPassword(password) === encryptedPassword;
  }

  // 비밀번호 암호화
  _encryptPassword(password: string) {
    const salt = config.get<string>('pbkdf2.salt');
    const iterations = config.get<number>('pbkdf2.iterations');
    const keylen = config.get<number>('pbkdf2.keylen');
    const digest = config.get<string>('pbkdf2.digest');
    const pbkdf2 = pbkdf2Sync(password, salt, iterations, keylen, digest);
    return pbkdf2.toString('base64');
  }
}
