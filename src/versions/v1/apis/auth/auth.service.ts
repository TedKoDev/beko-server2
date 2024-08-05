import { PrismaService } from '@/prisma';
import { ROLE } from '@/types/v1';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as config from 'config';
import { pbkdf2Sync } from 'crypto';
import * as dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

export const AUTH_SERVICE_TOKEN = 'AUTH_SERVICE_TOKEN';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // 회원가입
  async registerUser(email: string, password: string, name: string) {
    const emailVerificationToken = uuidv4();
    const encryptedPassword = this._encryptPassword(password);
    return this.prisma.users.create({
      data: {
        email,
        encrypted_password: encryptedPassword,
        username: name,
        email_verification_token: emailVerificationToken,
        is_email_verified: false,
        role: ROLE.USER,
      },
    });
  }

  // 로그인
  async loginUser(email: string, password: string) {
    const user = await this.prisma.users.findUnique({
      where: { email },
      select: {
        user_id: true,
        encrypted_password: true,
        is_email_verified: true,
      },
    });

    if (user === null) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = this._comparePassword(
      password,
      user.encrypted_password,
    );

    if (!isPasswordValid) {
      throw new Error('Invalid credentials or email not verified');
    }

    // 코드 유효기간 1분
    const expiredAt = dayjs().add(1, 'minute').toDate();
    const existingAuthCode = await this.prisma.authCode.findUnique({
      where: { user_id: user.user_id },
    });

    if (existingAuthCode) {
      await this.prisma.authCode.delete({ where: { user_id: user.user_id } });
    }

    const { code, keojak_code } = await this.prisma.authCode.create({
      data: {
        user_id: user.user_id,
        expired_at: expiredAt,
      },
    });

    return { authCode: code, keojakCode: keojak_code };
  }

  // 이메일 인증
  async confirmEmail(token: string) {
    return this.prisma.users.updateMany({
      where: { email_verification_token: token },
      data: { is_email_verified: true },
    });
  }

  // 카페 24 인증 토큰 발급
  async getToken(code: string) {
    const codeInfo = await this.prisma.authCode.findUnique({ where: { code } });

    if (!codeInfo) {
      throw new Error('Invalid authorization code');
    }

    const isExpired = dayjs().isAfter(dayjs(codeInfo.expired_at));
    if (isExpired) {
      throw new Error('Authorization code expired');
    }

    const payload = { userId: codeInfo.user_id };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1m' });
    return { access_token: accessToken };
  }

  // 커작 인증 토큰 발급
  async getKeojakToken(keojakCode: string) {
    const codeInfo = await this.prisma.authCode.findUnique({
      where: { keojak_code: keojakCode },
    });

    if (!codeInfo) {
      throw new Error('Invalid authorization code');
    }

    const isExpired = dayjs().isAfter(dayjs(codeInfo.expired_at));
    if (isExpired) {
      throw new Error('Authorization code expired');
    }

    const user = await this.prisma.users.findUnique({
      where: { user_id: codeInfo.user_id },
    });

    const payload = { userId: codeInfo.user_id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    return { access_token: accessToken };
  }

  // 사용자 정보
  async getUserInfo(userId: number) {
    return this.prisma.users.findUnique({
      where: { user_id: userId },
      select: { user_id: true, email: true, username: true },
    });
  }

  // 사용자 정보 가져오기
  async getUserInfoBody(userId: number) {
    return this.prisma.users.findUnique({
      where: { user_id: userId },
      select: { user_id: true, email: true, username: true },
    });
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
