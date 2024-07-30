import { MongoPrismaService } from '@/prisma/prisma.service';
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
      },
    });

    return data;
  }

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
    await this.prisma.auth_code.create({
      data: { code: authCode, user_id: data.id },
    });

    return { authCode };
  }

  async confirmEmail(token: string) {
    const data = await this.prisma.users.updateMany({
      where: { email_verification_token: token },
      data: { is_email_verified: true },
    });

    return data;
  }

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

  async generateAuthCode(user: any) {
    const authCode = uuidv4();
    await this.prisma.auth_code.create({
      data: { code: authCode, user_id: user.id },
    });

    return authCode;
  }

  async getToken(authCode: string) {
    const data = await this.prisma.auth_code.findFirst({
      where: { code: authCode },
    });

    if (!data) {
      throw new Error('Invalid authorization code');
    }

    const payload = { userId: data.user_id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

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

  async getUserInfoBody(accessToken: string) {
    const payload = this.jwtService.verify(accessToken);
    return this.getUserInfo(payload.userId);
  }

  _comparePassword(password: string, encryptedPassword: string) {
    return this._encryptPassword(password) === encryptedPassword;
  }

  _encryptPassword(password: string) {
    const salt = config.get<string>('pbkdf2.salt');
    const iterations = config.get<number>('pbkdf2.iterations');
    const keylen = config.get<number>('pbkdf2.keylen');
    const digest = config.get<string>('pbkdf2.digest');
    const pbkdf2 = pbkdf2Sync(password, salt, iterations, keylen, digest);
    return pbkdf2.toString('base64');
  }
}
