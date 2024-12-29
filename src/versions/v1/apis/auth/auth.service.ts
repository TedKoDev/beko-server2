import { PrismaService } from '@/prisma';
import { ROLE } from '@/types/v1'; // accountStatus import
import { MailerService } from '@nestjs-modules/mailer';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { accountStatus, social_provider } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as config from 'config';
import { pbkdf2Sync } from 'crypto';
import * as dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { CountryService } from '../country/country.service';
import { EmailService } from '../email';
import { UpdateNotificationSettingsDto } from './dto/notification-settings.dto';

export const AUTH_SERVICE_TOKEN = 'AUTH_SERVICE_TOKEN';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService, // EmailService 주입
    private readonly countryService: CountryService, // CountryService 주입
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}
  // 구글 로그인

  // 회원가입
  async registerUser(
    email: string,
    password: string,
    name: string,
    country_id: number,
    term_agreement: boolean,
    privacy_agreement: boolean,
    marketing_agreement: boolean,
  ) {
    try {
      console.log('country_id', country_id);
      console.log('term_agreement', term_agreement);
      console.log('privacy_agreement', privacy_agreement);
      console.log('marketing_agreement', marketing_agreement);

      const existingEmailUser = await this.prisma.users.findFirst({
        where: {
          email,
          social_login: {
            none: {}, // 소셜 로그인이 아닌 경우만 체크
          },
        },
      });

      if (existingEmailUser) {
        throw new HttpException(
          '이미 사용 중인 이메일입니다',
          HttpStatus.CONFLICT,
        );
      }

      const emailVerificationToken = uuidv4();
      const encryptedPassword = await bcrypt.hash(password, 10);

      let finalUsername = name;
      const existingUsernameUser = await this.prisma.users.findUnique({
        where: { username: name },
      });

      if (existingUsernameUser) {
        const uniqueSuffix = `#${uuidv4().slice(0, 8)}`;
        finalUsername = `${name}${uniqueSuffix}`;
      }
      let notification_benefit = true;
      if (marketing_agreement === false) {
        notification_benefit = false;
      }

      const user = await this.prisma.users.create({
        data: {
          email,
          encrypted_password: encryptedPassword,
          username: finalUsername,
          email_verification_token: emailVerificationToken,
          // email_verification_token: null,
          is_email_verified: false,
          // is_email_verified: true,
          role: ROLE.USER,
          account_status: accountStatus.INACTIVE,
          // account_status: accountStatus.ACTIVE,
          country_id: country_id,
          terms_agreed: term_agreement,
          terms_agreed_at: new Date(),
          privacy_agreed: privacy_agreement,
          privacy_agreed_at: new Date(),
          marketing_agreed: marketing_agreement,
          marketing_agreed_at: new Date(),
          notification_benefit: notification_benefit,
          notification_community: true,
          notification_benefit_at: new Date(),
          notification_community_at: new Date(),
        },
      });

      // 이메일 인증 부분 주석 처리

      try {
        await this.emailService.sendUserConfirmation(
          email,
          emailVerificationToken,
        );
      } catch (emailError) {
        // 이메일 전송 실패 시 생성된 유저 삭제
        await this.prisma.users.delete({ where: { user_id: user.user_id } });
        throw new HttpException(
          '이메일 전송에 실패했습니다',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      // 이메일 인증 없이 바로 처리된 것으로 간주
      await this.prisma.point.create({
        data: {
          user_id: user.user_id,
          points_change: 100,
          change_reason: 'New user registration',
        },
      });

      // 포인트 user 테이블에 추가
      await this.prisma.users.update({
        where: { user_id: user.user_id },
        data: { points: { increment: 100 } },
      });

      // 해당하는 country count +1 추가하기
      // 국가 카운트 증가
      await this.countryService.updateUserCount(country_id, true); // country_id를 문자열로 변환하여 사용

      return {
        message: 'Please check your email to verify your account.',
        username: finalUsername,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error.code === 'P2002') {
        // Prisma unique constraint error
        throw new HttpException(
          '중복된 데이터가 존재합니다',
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        '회원가입 처리 중 오류가 발생했습니다',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 로그인
  async loginUser(email: string, password: string) {
    const user = await this.prisma.users.findFirst({
      where: {
        email,
        encrypted_password: { not: null },
      },
    });

    if (!user) {
      throw new HttpException(
        '존재하지 않는 사용자입니다',
        HttpStatus.NOT_FOUND,
      );
    }

    const isMatch = await bcrypt.compare(password, user.encrypted_password);
    if (!isMatch) {
      throw new HttpException(
        '비밀번호가 일치하지 않습니다',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.is_email_verified === false) {
      throw new HttpException(
        'Please verify your email to continue',
        HttpStatus.FORBIDDEN,
      );
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);
    // console.log('logintokens', tokens);

    // Store refresh token hash in database
    await this.updateRefreshToken(user.user_id, tokens.refresh_token);

    return {
      ...tokens,
      user: {
        user_id: user.user_id,
        username: user.username,
      },
    };
  }

  async generateTokens(user: any) {
    const payload = { userId: user.user_id, role: user.role };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '60m' }), // 액세스 토큰 60분
      this.jwtService.signAsync(payload, { expiresIn: '14d' }), // 리프레시 토큰 14일
    ]);

    return {
      access_token,
      refresh_token,
    };
  }

  async updateRefreshToken(userId: number, refresh_token: string) {
    // Store hashed refresh token
    const hash = await bcrypt.hash(refresh_token, 10);
    await this.prisma.users.update({
      where: { user_id: userId },
      data: { hashed_refresh_token: hash },
    });
  }

  async refreshTokens(refresh_token: string) {
    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyAsync(refresh_token);
      const user = await this.prisma.users.findUnique({
        where: { user_id: payload.userId },
      });

      if (!user || !user.hashed_refresh_token) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Verify stored hash
      const isValid = await bcrypt.compare(
        refresh_token,
        user.hashed_refresh_token,
      );
      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);
      await this.updateRefreshToken(user.user_id, tokens.refresh_token);

      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // 경험치 기반 레벨 업데이트 함수
  private async updateLevelBasedOnExp(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
      select: { experience_points: true, level: true },
    });

    if (!user) return;

    // 모든 레벨 임계값 가져오기 (오름차순)
    const levelThresholds = await this.prisma.levelthreshold.findMany({
      orderBy: { level: 'asc' },
      select: { level: true, min_experience: true },
    });

    // 현재 경험치에 맞는 레벨 찾기
    let appropriateLevel = 1; // 기본 레벨
    for (const threshold of levelThresholds) {
      if (user.experience_points >= threshold.min_experience) {
        appropriateLevel = threshold.level;
      } else {
        break; // 현재 경험치보다 높은 임계값을 만나면 중단
      }
    }

    // 현재 레벨과 다르다면 업데이트
    if (user.level !== appropriateLevel) {
      await this.prisma.users.update({
        where: { user_id: userId },
        data: { level: appropriateLevel },
      });

      // 레벨업 했을 경우에만 포인트 지급 및 기록
      if (appropriateLevel > user.level) {
        const pointsToAdd = (appropriateLevel - user.level) * 100; // 레벨당 100포인트

        await this.prisma.users.update({
          where: { user_id: userId },
          data: {
            points: { increment: pointsToAdd },
          },
        });

        // 포인트 지급 기록
        await this.prisma.point.create({
          data: {
            user_id: userId,
            points_change: pointsToAdd,
            change_reason: `Level up to ${appropriateLevel}`,
          },
        });
      }
    }
  }

  // 이메일 인증
  async confirmEmail(token: string) {
    // 이메일 인증 토큰으로 유저를 찾음 (findUnique 대신 findFirst 사용)
    const user = await this.prisma.users.findFirst({
      where: { email_verification_token: token },
    });

    if (!user) {
      throw new Error('Invalid verification token');
    }

    // 이메일 인증 처리
    await this.prisma.users.update({
      where: { user_id: user.user_id }, // 고유한 필드인 user_id 사용
      data: {
        is_email_verified: true,
        account_status: accountStatus.ACTIVE, // 인증 후 계정 활성화
        email_verification_token: null, // 토큰 삭제
      },
    });

    return { message: 'Email confirmed successfully!' };
  }

  // 유저레벨 업데트
  private async updateUserLevel(userId: number) {
    const [postsCount, commentsCount, likesCount, user] = await Promise.all([
      this.prisma.post.count({ where: { user_id: userId, deleted_at: null } }),
      this.prisma.comment.count({
        where: { user_id: userId, deleted_at: null },
      }),
      this.prisma.like.count({ where: { user_id: userId, deleted_at: null } }),
      this.prisma.users.findUnique({
        where: { user_id: userId },
        select: { level: true, login_count: true },
      }),
    ]);

    const thresholds = await this.prisma.levelthreshold.findMany({
      orderBy: { level: 'asc' },
    });

    let newLevel = 1;
    for (const threshold of thresholds) {
      if (
        postsCount >= threshold.min_posts &&
        commentsCount >= threshold.min_comments &&
        likesCount >= threshold.min_likes &&
        user.login_count >= threshold.min_logins
      ) {
        newLevel = threshold.level;
      }
    }

    if (user.level !== newLevel) {
      await this.prisma.users.update({
        where: { user_id: userId },
        data: { level: newLevel },
      });
    }
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
    const accessToken = this.jwtService.sign(payload, { expiresIn: '12h' });
    return { access_token: accessToken };
  }

  // 사용자 정보
  async getUserInfo(userId: number) {
    return this.prisma.users.findUnique({
      where: { user_id: userId },
      // select: { user_id: true, email: true, username: true },
    });
  }

  // 사용자 정보 가져오기
  async getUserInfoBody(userId: number) {
    return this.prisma.users.findUnique({
      where: { user_id: userId },
      // select: { user_id: true, email: true, username: true },
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

  async checkEmail(email: string) {
    try {
      // 일반 회원가입 사용자만 확인
      const existingUser = await this.prisma.users.findFirst({
        where: {
          email,
          social_login: {
            none: {}, // 소셜 로그인이 아닌 경우만 체크
          },
        },
      });

      if (existingUser) {
        throw new HttpException(
          '이미 사용 중인 이메일입니다',
          HttpStatus.CONFLICT,
        );
      }

      return { available: true, message: '사용 가능한 이메일입니다' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        '이메일 확인 중 오류가 발생했습니다',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async checkName(name: string) {
    try {
      const existingUser = await this.prisma.users.findUnique({
        where: { username: name },
      });

      if (existingUser) {
        throw new HttpException(
          '이미 사용 중인 이름입니다',
          HttpStatus.CONFLICT,
        );
      }

      return { available: true, message: '사용 가능한 이름입니다' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        '이름 확인 중 오류가 발생했습니다',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async validateUserPassword(
    userId: number,
    password: string,
  ): Promise<boolean> {
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 비밀번호 비교 로직
    const isMatch = await bcrypt.compare(password, user.encrypted_password);
    return isMatch;
  }

  async validateSocialUser(
    provider: social_provider,
    providerUserId: string,
    email: string,
    name?: string,
  ) {
    try {
      // 1. 동일한 소셜 로그인 정보가 있는지만 확인
      const existingSocialLogin = await this.prisma.socialLogin.findFirst({
        where: {
          AND: [
            { social_provider: provider },
            { provider_user_id: providerUserId },
          ],
        },
        include: {
          user: true,
        },
      });

      if (existingSocialLogin) {
        return existingSocialLogin.user;
      }

      // 2. 새로운 소셜 로그인 사용자 생성
      const newUser = await this.prisma.$transaction(async (prisma) => {
        const username = await this.generateUniqueUsername(
          name || `${provider.toLowerCase()}_user`,
        );

        const user = await prisma.users.create({
          data: {
            email,
            username,
            // encrypted_password: null, // 소셜 로그인은 비밀번호 없음
            is_email_verified: true,
            role: ROLE.USER,
            account_status: accountStatus.ACTIVE,
            social_login: {
              create: {
                social_provider: provider,
                provider_user_id: providerUserId,
                email: email,
              },
            },
          },
        });

        // 신규 가입 포인트 지급
        await prisma.point.create({
          data: {
            user_id: user.user_id,
            points_change: 2000,
            change_reason: `New user registration with ${provider}`,
          },
        });

        return user;
      });

      return newUser;
    } catch (error) {
      console.error('Social login error:', error);
      throw new HttpException(
        '소셜 로그인 처리 중 오류가 발생했습니다',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async generateUniqueUsername(baseUsername: string): Promise<string> {
    try {
      // 특수문자 및 공백 제거, 소문자로 변환
      const sanitizedUsername = baseUsername
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '_');

      // 기본 username으로 먼저 시도
      let username = sanitizedUsername;
      let counter = 1;

      while (true) {
        const existingUser = await this.prisma.users.findUnique({
          where: { username },
        });

        if (!existingUser) {
          return username;
        }

        // 중복되는 경우 숫자를 붙여서 재시도
        username = `${sanitizedUsername}_${counter}`;
        counter++;

        // 안전장치: 너무 많은 시도를 방지
        if (counter > 1000) {
          throw new HttpException(
            '사용자 이름 생성에 실패했습니다',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }
    } catch (error) {
      console.error('Username generation error:', error);
      throw new HttpException(
        '사용자 이름 생성 중 오류가 발생했습니다',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateNotificationSettings(
    userId: number,
    settings: UpdateNotificationSettingsDto,
  ) {
    try {
      const updatedUser = await this.prisma.users.update({
        where: { user_id: userId },
        data: {
          notification_benefit: settings.notification_benefit,
          notification_community: settings.notification_community,
          notification_benefit_at: new Date(),
          notification_community_at: new Date(),
          marketing_agreed: settings.notification_benefit,
          marketing_agreed_at: new Date(),
        },
      });

      return {
        notification_benefit: updatedUser.notification_benefit,
        notification_community: updatedUser.notification_community,
        message: '알림 설정이 업데이트되었습니다.',
      };
    } catch (error) {
      throw new HttpException(
        '알림 설정 업데이트 중 오류가 발생했습니다',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 알림 설정 조회 메서드
  async getNotificationSettings(userId: number) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { user_id: userId },
        select: {
          notification_benefit: true,
          notification_community: true,
          notification_benefit_at: true,
          notification_community_at: true,
        },
      });

      if (!user) {
        throw new HttpException(
          '사용자를 찾을 수 없습니다',
          HttpStatus.NOT_FOUND,
        );
      }

      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        '알림 설정 조회 중 오류가 발생했습니다',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async forgotPassword(email: string) {
    // 소셜 로그인이 아닌 사용자만 찾기
    const user = await this.prisma.users.findFirst({
      where: {
        email,
        social_login: {
          none: {},
        },
      },
    });

    if (!user) {
      throw new NotFoundException(
        'No user found with this email or user is registered through social login',
      );
    }

    // 임시 비밀번호 생성 (8자리: 숫자 + 대소문자)
    const temporaryPassword =
      Math.random().toString(36).slice(-4) +
      Math.random().toString(36).toUpperCase().slice(-4);

    // 임시 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // 비밀번호 업데이트
    await this.prisma.users.update({
      where: {
        user_id: user.user_id,
      },
      data: {
        encrypted_password: hashedPassword,
      },
    });

    // 임시 비밀번호 이메일 발송
    await this.emailService.sendTemporaryPassword(email, temporaryPassword);

    return { message: 'Temporary password has been sent to your email' };
  }

  async resetPassword(token: string, newPassword: string) {
    // 토큰으로 사용자 찾기
    const user = await this.prisma.users.findFirst({
      where: {
        reset_password_token: token,
        reset_password_expires: {
          gt: new Date(), // 만료되지 않은 토큰
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // 새 비밀번호 해시
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 비밀번호 업데이트 및 토큰 초기화
    await this.prisma.users.update({
      where: { user_id: user.user_id },
      data: {
        encrypted_password: hashedPassword,
        reset_password_token: null,
        reset_password_expires: null,
      },
    });

    return { message: 'Password has been reset successfully' };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.prisma.users.findFirst({
      where: {
        email,
        is_email_verified: false,
        social_login: {
          none: {}, // 소셜 로그인이 아닌 경우만
        },
      },
    });

    if (!user) {
      throw new HttpException(
        '인증 대기 중인 이메일을 찾을 수 없습니다',
        HttpStatus.NOT_FOUND,
      );
    }

    // 새로운 인증 토큰 생성
    const newEmailVerificationToken = uuidv4();

    // 토큰 업데이트
    await this.prisma.users.update({
      where: { user_id: user.user_id },
      data: { email_verification_token: newEmailVerificationToken },
    });

    try {
      await this.emailService.sendUserConfirmation(
        email,
        newEmailVerificationToken,
      );
      return { message: '인증 이메일이 재전송되었습니다.' };
    } catch (error) {
      throw new HttpException(
        '이메일 전송에 실패했습니다',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
