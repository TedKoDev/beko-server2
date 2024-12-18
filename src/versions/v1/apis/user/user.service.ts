import { PrismaService } from '@/prisma';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UpdateAgreementsDto } from './dto/update-agreements.dto';

import { LevelThresholdService } from '../level/level.service';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';
import { UserDTO } from './dto/user.dto';

export const USER_SERVIE_TOKEN = 'USER_SERVIE_TOKEN';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private levelThresholdService: LevelThresholdService,
  ) {}

  // 사용자 프로필 조회
  async profile(userId: number) {
    return this.prisma.users.findUnique({
      where: { user_id: userId },
    });
  }

  // 사용자 정보 수정
  // async updateUser(
  //   userId: number,
  //   updateData: {
  //     username: string;
  //     bio: string;
  //     profile_picture_url?: string;
  //     country_id: number;
  //     terms_agreed: boolean;
  //     privacy_agreed: boolean;
  //     marketing_agreed: boolean;
  //   },
  // ) {
  //   // 중복된 username 확인
  //   let finalUsername = updateData.username;
  //   const existingUser = await this.prisma.users.findUnique({
  //     where: { username: updateData.username },
  //   });

  //   if (existingUser && existingUser.user_id !== userId) {
  //     const uniqueSuffix = `#${uuidv4().slice(0, 8)}`;
  //     finalUsername = `${updateData.username}${uniqueSuffix}`;
  //   }

  //   // 사용자 정보 업데이트
  //   return this.prisma.users.update({
  //     where: { user_id: userId },
  //     data: {
  //       username: finalUsername,
  //       bio: updateData.bio,
  //       profile_picture_url: updateData.profile_picture_url,
  //       country_id: updateData.country_id,
  //       terms_agreed: updateData.terms_agreed,
  //       privacy_agreed: updateData.privacy_agreed,
  //       marketing_agreed: updateData.marketing_agreed,
  //       updated_at: new Date(),
  //     },
  //   });
  // }
  async updateUser(
    userId: number,
    updateData: {
      username: string;
      bio: string;
      profile_picture_url?: string;
      country_id: number;
      terms_agreed: boolean;
      privacy_agreed: boolean;
      marketing_agreed: boolean;
    },
  ) {
    // 중복된 username 확인
    let finalUsername = updateData.username;
    const existingUser = await this.prisma.users.findUnique({
      where: { username: updateData.username },
    });

    if (existingUser && existingUser.user_id !== userId) {
      const uniqueSuffix = `#${uuidv4().slice(0, 8)}`;
      finalUsername = `${updateData.username}${uniqueSuffix}`;
    }

    // 사용자 정보 업데이트
    const updatedUser = await this.prisma.users.update({
      where: { user_id: userId },
      data: {
        username: finalUsername,
        bio: updateData.bio,
        profile_picture_url: updateData.profile_picture_url,
        country_id: updateData.country_id,
        terms_agreed: updateData.terms_agreed,
        privacy_agreed: updateData.privacy_agreed,
        marketing_agreed: updateData.marketing_agreed,
        updated_at: new Date(),
      },
    });

    // 국가 정보 조회
    const country = await this.prisma.country.findUnique({
      where: { country_id: updateData.country_id },
      select: {
        country_id: true,
        country_code: true,
        country_name: true,
        flag_icon: true,
      },
    });

    // 통계 정보 조회
    const stats = await this.prisma.$transaction([
      this.prisma.post.count({ where: { user_id: userId, deleted_at: null } }),
      this.prisma.comment.count({
        where: { user_id: userId, deleted_at: null },
      }),
      this.prisma.like.count({ where: { user_id: userId, deleted_at: null } }),
      this.prisma.follow.count({
        where: { follower_id: userId, deleted_at: null },
      }),
      this.prisma.follow.count({
        where: { following_id: userId, deleted_at: null },
      }),
    ]);

    // 응답 형식 구성
    return {
      ...updatedUser,
      country,
      stats: {
        postCount: stats[0],
        commentCount: stats[1],
        likedPostsCount: stats[2],
        followingCount: stats[3],
        followersCount: stats[4],
      },
    };
  }

  // 사용자 이름 중복 확인
  async checkUsername(username: string) {
    const existingUser = await this.prisma.users.findUnique({
      where: { username },
    });
    return existingUser ? false : true;
  }

  // 유저 리스트 페이징 조회
  async getUsers(page: number = 1, limit: number = 10, search: string = '') {
    const skip = (page - 1) * limit;

    const [users, totalCount] = await Promise.all([
      this.prisma.users.findMany({
        skip,
        take: limit,
        where: {
          username: {
            contains: search,
            mode: 'insensitive',
          },
        },
        orderBy: {
          created_at: 'desc', // 정렬 기준 설정
        },
      }),
      this.prisma.users.count({
        where: {
          username: {
            contains: search,
            mode: 'insensitive',
          },
        },
      }),
    ]);

    return {
      data: users,
      total: totalCount,
      page,
      limit,
    };
  }

  // 유저 통계 조회 - 삭제된 항목 제외

  async getUserById(userId: number): Promise<{
    user: UserDTO;
    stats: {
      postCount: number;
      commentCount: number;
      likedPostsCount: number;
      followingCount: number;
      followersCount: number;
    };
  }> {
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
      include: {
        post: {
          where: {
            deleted_at: null,
          },
        },
        comment: {
          where: {
            deleted_at: null,
          },
        },
        like: {
          where: {
            deleted_at: null,
          },
        },
        following: {
          where: {
            deleted_at: null,
          },
        },
        followers: {
          where: {
            deleted_at: null,
          },
        },
        social_login: {
          where: {
            deleted_at: null,
          },
        },
        country: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const postCount = user.post.length;
    const commentCount = user.comment.length;
    const likedPostsCount = user.like.length;
    const followingCount = user.following.length;
    const followersCount = user.followers.length;

    return {
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        encrypted_password: user.encrypted_password,
        profile_picture_url: user.profile_picture_url,
        phone_number: user.phone_number,
        email_verification_token: user.email_verification_token,
        points: user.points,
        level: user.level,
        is_email_verified: user.is_email_verified,
        role: user.role,
        account_status: user.account_status,
        sign_up_ip: user.sign_up_ip,
        created_at: user.created_at,
        last_login_at: user.last_login_at,
        updated_at: user.updated_at,
        deleted_at: user.deleted_at,
        country: user.country
          ? {
              country_id: user.country.country_id,
              country_code: user.country.country_code,
              country_name: user.country.country_name,
              flag_icon: user.country.flag_icon,
            }
          : null,
        social_login: user.social_login.map((social) => ({
          social_login_id: social.social_login_id,
          user_id: social.user_id,
          provider: social.social_provider,
          provider_user_id: social.provider_user_id,
          created_at: social.created_at,
          updated_at: social.updated_at,
          deleted_at: social.deleted_at,
        })),
      },
      stats: {
        postCount,
        commentCount,
        likedPostsCount,
        followingCount,
        followersCount,
      },
    };
  }

  // 현재 로그인한 사용자의 정보 조회
  async getCurrentUser(userId: number) {
    // 레벨업 체크 수행
    await this.levelThresholdService.checkAndProcessLevelUp(userId);

    console.log('getCurrentUser - 1', userId);

    // 갱신된 사용자 정보 조회
    const user = await this.prisma.users.findUnique({
      where: {
        user_id: userId,
      },
      include: {
        post: {
          where: { deleted_at: null },
        },
        comment: {
          where: { deleted_at: null },
        },
        like: {
          where: { deleted_at: null },
        },
        following: true,
        followers: true,
        social_login: {
          where: { deleted_at: null },
        },
        country: true,
      },
    });

    if (!user) {
      console.log('user not found');
      throw new NotFoundException('User not found');
    }
    // console.log('user', user);

    return {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profile_picture_url: user.profile_picture_url,
      points: user.points,
      level: user.level,
      experience_points: user.experience_points,
      today_task_count: user.today_task_count,
      role: user.role,
      account_status: user.account_status,
      created_at: user.created_at,
      last_login_at: user.last_login_at,
      terms_agreed: user.terms_agreed,
      privacy_agreed: user.privacy_agreed,
      marketing_agreed: user.marketing_agreed,
      social_login: user.social_login.map((social) => ({
        social_login_id: social.social_login_id,
        user_id: social.user_id,
        provider: social.social_provider,
        provider_user_id: social.provider_user_id,
        created_at: social.created_at,
        updated_at: social.updated_at,
        deleted_at: social.deleted_at,
      })),
      country: user.country
        ? {
            country_id: user.country.country_id,
            country_code: user.country.country_code,
            country_name: user.country.country_name,
            flag_icon: user.country.flag_icon,
          }
        : null,

      stats: {
        postCount: user.post.length,
        commentCount: user.comment.length,
        likedPostsCount: user.like.length,
        followingCount: user.following.length,
        followersCount: user.followers.length,
      },
    };
  }

  async deactivateUser(userId: number) {
    // 트랜잭션으로 처리
    return await this.prisma.$transaction(async (prisma) => {
      const user = await prisma.users.findUnique({
        where: { user_id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // 사용자 계정 비활성화
      await prisma.users.update({
        where: { user_id: userId },
        data: {
          account_status: 'INACTIVE',
          deleted_at: new Date(),
          // 개인정보 마스킹 처리
          email: `deleted_${userId}@deleted.com`,
          username: `Anonymous`,
          bio: null,
          profile_picture_url: null,
          phone_number: null,
          // 필요한 경우 다른 개인정보도 마스킹 또는 삭제
        },
      });

      // 관련된 소셜 로그인 정보 비활성화
      await prisma.socialLogin.updateMany({
        where: { user_id: userId },
        data: {
          deleted_at: new Date(),
        },
      });

      // 팔로우 관계 비활성화
      await prisma.follow.updateMany({
        where: {
          OR: [{ follower_id: userId }, { following_id: userId }],
        },
        data: {
          deleted_at: new Date(),
        },
      });

      return {
        message: '계정이 성공적으로 비활성화되었습니다.',
        deactivatedAt: new Date(),
      };
    });
  }

  // 알림 설정 업데이트
  async updateNotificationSettings(
    userId: number,
    settings: UpdateNotificationSettingsDto,
  ) {
    try {
      const updatedUser = await this.prisma.users.update({
        where: { user_id: userId },
        data: {
          notification_benefit: settings.notification_benefit,
          notification_benefit_at: settings.notification_benefit
            ? new Date()
            : null,
          notification_community: settings.notification_community,
          notification_community_at: settings.notification_community
            ? new Date()
            : null,
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

  // 알림 설정 조회
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

  // 마케팅 동의 설정 업데이트
  async updateAgreements(userId: number, agreements: UpdateAgreementsDto) {
    try {
      const updatedUser = await this.prisma.users.update({
        where: { user_id: userId },
        data: {
          marketing_agreed: agreements.marketing_agreed,
          marketing_agreed_at: agreements.marketing_agreed ? new Date() : null,
        },
      });

      return {
        marketing_agreed: updatedUser.marketing_agreed,
        marketing_agreed_at: updatedUser.marketing_agreed_at,
        message: '마케팅 수신 동의 설정이 업데이트되었습니다.',
      };
    } catch (error) {
      throw new HttpException(
        '동의 설정 업데이트 중 오류가 발생했습니다',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 동의 설정 조회
  async getAgreements(userId: number) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { user_id: userId },
        select: {
          terms_agreed: true,
          privacy_agreed: true,
          marketing_agreed: true,
          terms_agreed_at: true,
          privacy_agreed_at: true,
          marketing_agreed_at: true,
        },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Agreement settings retrieval error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    console.log('updatePassword', currentPassword, newPassword);
    try {
      // 현재 사용자 정보 조회
      const user = await this.prisma.users.findUnique({
        where: { user_id: userId },
      });

      if (!user) {
        console.log('user not found');
        throw new NotFoundException('User not found');
      }

      // 소셜 로그인 사용자 체크
      if (!user.encrypted_password) {
        console.log('social login user');
        throw new HttpException(
          'Social login user cannot change password',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 현재 비밀번호 확인
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.encrypted_password,
      );

      if (!isPasswordValid) {
        console.log('password not valid');
        throw new HttpException(
          'Current password is not valid',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 새 비밀번호가 현재 비밀번호와 같은지 확인
      if (currentPassword === newPassword) {
        console.log('password same');
        throw new HttpException(
          'New password must be different from the current password',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 새 비밀번호 암호화
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      console.log('hashedNewPassword', hashedNewPassword);
      // 비밀번호 업데이트
      await this.prisma.users.update({
        where: { user_id: userId },
        data: {
          encrypted_password: hashedNewPassword,
          updated_at: new Date(),
        },
      });

      console.log('password updated');
      return {
        message: 'Password changed successfully',
      };
    } catch (error) {
      console.log('error', error);
      if (error instanceof HttpException) {
        console.log('http exception');
        throw error;
      }
      console.log('internal server error');
      throw new HttpException(
        'Password change error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateInitialAgreements(
    userId: number,
    agreements: UpdateAgreementsDto,
  ) {
    try {
      const currentTime = new Date();

      const updatedUser = await this.prisma.users.update({
        where: { user_id: userId },
        data: {
          terms_agreed: agreements.terms_agreed,
          privacy_agreed: agreements.privacy_agreed,
          marketing_agreed: agreements.marketing_agreed,
          terms_agreed_at: agreements.terms_agreed ? currentTime : null,
          privacy_agreed_at: agreements.privacy_agreed ? currentTime : null,
          marketing_agreed_at: agreements.marketing_agreed ? currentTime : null,
        },
      });

      return {
        success: true,
        data: {
          terms_agreed: updatedUser.terms_agreed,
          privacy_agreed: updatedUser.privacy_agreed,
          marketing_agreed: updatedUser.marketing_agreed,
          terms_agreed_at: updatedUser.terms_agreed_at,
          privacy_agreed_at: updatedUser.privacy_agreed_at,
          marketing_agreed_at: updatedUser.marketing_agreed_at,
        },
        message: '약관 동의 정보가 성공적으로 저장되었습니다.',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException(
          '사용자 정보 업데이트 중 오류가 발생했습니다.',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        '서버 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
