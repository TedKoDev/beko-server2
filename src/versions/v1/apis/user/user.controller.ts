import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

import { Auth } from '@/decorators';
import { ROLE } from '@/types/v1';

import { AuthService } from '../auth/auth.service';
import { PaginationQueryDto } from './dto';
import { DeactivateUserDto } from './dto/deactivate-user.dto';

import { UpdateAgreementsDto } from './dto/update-agreements.dto';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { USER_SERVIE_TOKEN, UserService } from './user.service';

@Controller({
  path: 'users',
  version: '1',
})
export class UserController {
  s3Service: any;
  constructor(
    @Inject(USER_SERVIE_TOKEN)
    private readonly userService: UserService,

    private readonly authService: AuthService,
  ) {}

  @Get('profile')
  @Auth(['ANY'])
  async profile(@Req() req: { user: { userId: number; role: ROLE } }) {
    return this.userService.profile(req.user.userId);
  }

  @Post('update-profile')
  async updateUserProfile(
    @Body() dto: UpdateUserProfileDto,
    @Res() res: Response,
  ) {
    const updatedUser = await this.userService.updateUser(dto.userId, {
      username: dto.username,
      bio: dto.bio,
      profile_picture_url: dto.profile_picture_url,
    });
    return res.status(200).json(updatedUser);
  }

  @Get('profile-image-upload-url')
  @Auth(['ANY'])
  async getProfileImageUploadUrl(
    @Query('fileName') fileName: string,
    @Query('fileType') fileType: string,
  ) {
    const key = `profile-images/${Date.now()}-${fileName}`;
    return this.s3Service.getPresignedUrl(key, fileType);
  }

  @Get('check-username')
  async checkUsername(
    @Query('username') username: string,
    @Res() res: Response,
  ) {
    const isAvailable = await this.userService.checkUsername(username);
    return res.status(200).json({ available: isAvailable });
  }

  // 유저 리스트 조회
  @Get('list')
  async getUsers(
    @Query() paginationQuery: PaginationQueryDto,
    @Res() res: Response,
  ) {
    const { page, limit, search } = paginationQuery;
    const users = await this.userService.getUsers(page, limit, search);
    return res.status(200).json(users);
  }

  // 유저 상세 정보 조회

  // 유저 상세 정보 조회
  // 유저 상세 정보 및 통계 조회
  @Get('detail/:id')
  async getUserById(@Param('id') userId: number) {
    try {
      const userWithStats = await this.userService.getUserById(userId);
      return {
        status: 'success',
        data: userWithStats,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Get('me')
  @Auth(['ANY'])
  async getCurrentUser(@Req() req: { user: { userId: number } }) {
    // console.log('me', req);
    const userId = req.user.userId; // JWT에서 추출한 userId

    console.log('me', userId);
    return this.userService.getCurrentUser(userId);
  }

  @Post('deactivate')
  @Auth(['ANY'])
  async deactivateUser(
    @Req() req: { user: { userId: number } },
    @Body() dto: DeactivateUserDto,
  ) {
    console.log('User ID:', req.user.userId);
    console.log('Password:', dto.password); // 비밀번호 로그

    const isPasswordValid = await this.authService.validateUserPassword(
      req.user.userId,
      dto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    return this.userService.deactivateUser(req.user.userId);
  }

  // 알림 설정 업데이트
  @Patch('notification-settings')
  @Auth(['ANY'])
  async updateNotificationSettings(
    @Req() req: { user: { userId: number } },
    @Body() settings: UpdateNotificationSettingsDto,
  ) {
    console.log('settings', settings);
    return this.userService.updateNotificationSettings(
      req.user.userId,
      settings,
    );
  }

  // 알림 설정 조회
  @Get('notification-settings')
  @Auth(['ANY'])
  async getNotificationSettings(@Req() req: { user: { userId: number } }) {
    return this.userService.getNotificationSettings(req.user.userId);
  }

  // 마케팅 동의 설정 업데이트
  @Patch('agreements')
  @Auth(['ANY'])
  async updateAgreements(
    @Req() req: { user: { userId: number } },
    @Body() agreements: UpdateAgreementsDto,
  ) {
    return this.userService.updateAgreements(req.user.userId, agreements);
  }

  // 동의 설정 조회
  @Get('agreements')
  @Auth(['ANY'])
  async getAgreements(@Req() req: { user: { userId: number } }) {
    return this.userService.getAgreements(req.user.userId);
  }
}
