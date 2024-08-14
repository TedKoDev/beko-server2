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
    // Check if the email already exists
    const existingEmailUser = await this.prisma.users.findUnique({
      where: { email },
    });

    if (existingEmailUser) {
      throw new Error('Email is already in use');
    }

    const emailVerificationToken = uuidv4();
    const encryptedPassword = this._encryptPassword(password);

    // Check if the username already exists
    let finalUsername = name;
    const existingUsernameUser = await this.prisma.users.findUnique({
      where: { username: name },
    });

    if (existingUsernameUser) {
      const uniqueSuffix = `#${uuidv4().slice(0, 8)}`;
      finalUsername = `${name}${uniqueSuffix}`;
    }

    const user = await this.prisma.users.create({
      data: {
        email,
        encrypted_password: encryptedPassword,
        username: finalUsername,
        email_verification_token: emailVerificationToken,
        is_email_verified: false,
        role: ROLE.USER,
      },
    });

    // Add initial points to the new user
    await this.prisma.point.create({
      data: {
        user_id: user.user_id,
        points_change: 2000,
        change_reason: 'New user registration',
      },
    });

    // Return a message with the final username
    return {
      message:
        'User registered. Please check your email for verification link.',
      username: finalUsername, // include the final username in the response
    };
  }

  // 로그인
  // 로그인
  async loginUser(email: string, password: string) {
    console.log('loginUser');
    console.log(email);
    const user = await this.prisma.users.findUnique({
      where: { email },
      select: {
        user_id: true,
        encrypted_password: true,
        is_email_verified: true,
        level: true, // Add this line
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

    // Check user activity for level update
    await this.updateUserLevel(user.user_id);

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

  // 레벨 업데이트
  private async updateUserLevel(userId: number) {
    // Get user activity counts
    const [postsCount, commentsCount, likesCount] = await Promise.all([
      this.prisma.post.count({
        where: {
          user_id: userId,
          deleted_at: null,
        },
      }),
      this.prisma.comment.count({
        where: {
          user_id: userId,
          deleted_at: null,
        },
      }),
      this.prisma.like.count({
        where: {
          user_id: userId,
          deleted_at: null,
        },
      }),
    ]);

    // Get level thresholds
    const thresholds = await this.prisma.levelthreshold.findMany({
      orderBy: { level: 'asc' },
    });

    // Determine new level
    let newLevel = 1;
    for (const threshold of thresholds) {
      if (
        postsCount >= threshold.min_posts &&
        commentsCount >= threshold.min_comments &&
        likesCount >= threshold.min_likes
      ) {
        newLevel = threshold.level;
      }
    }

    // Update user's level if changed
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
    });
    // console.log('user.level', user.level);

    if (user.level !== newLevel) {
      await this.prisma.users.update({
        where: { user_id: userId },
        data: { level: newLevel },
      });
    }
  }

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
