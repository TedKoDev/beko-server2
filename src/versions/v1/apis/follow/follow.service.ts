import { PrismaService } from '@/prisma/postsql-prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Injectable()
export class FollowService {
  constructor(private prisma: PrismaService) {}

  async toggleFollowUser(followerId: number, followingId: number) {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself.');
    }

    const existingFollow = await this.prisma.follow.findFirst({
      where: {
        follower_id: followerId,
        following_id: followingId,
      },
    });

    if (existingFollow && !existingFollow.deleted_at) {
      // 언팔로우
      await this.prisma.follow.update({
        where: {
          follow_id: existingFollow.follow_id,
        },
        data: {
          deleted_at: new Date(),
        },
      });
      return { message: 'Unfollowed successfully' };
    } else if (existingFollow && existingFollow.deleted_at) {
      // 팔로우 다시 복구
      await this.prisma.follow.update({
        where: {
          follow_id: existingFollow.follow_id,
        },
        data: {
          deleted_at: null,
        },
      });
      return { message: 'Followed successfully' };
    } else {
      // 새로운 팔로우
      await this.prisma.follow.create({
        data: {
          follower_id: followerId,
          following_id: followingId,
        },
      });
      return { message: 'Followed successfully' };
    }
  }

  async getFollowers(userId: number, paginationQuery: PaginationQueryDto) {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [followers, totalCount] = await Promise.all([
      this.prisma.follow.findMany({
        where: {
          following_id: userId,
          deleted_at: null,
        },
        include: {
          follower: true,
        },
        skip: parseInt(skip.toString(), 10), // 정수 변환
        take: parseInt(limit.toString(), 10), // 정수 변환
      }),
      this.prisma.follow.count({
        where: {
          following_id: userId,
          deleted_at: null,
        },
      }),
    ]);

    return {
      data: followers,
      total: totalCount,
      page,
      limit,
    };
  }

  async getFollowing(userId: number, paginationQuery: PaginationQueryDto) {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [following, totalCount] = await Promise.all([
      this.prisma.follow.findMany({
        where: {
          follower_id: userId,
          deleted_at: null,
        },
        include: {
          following: true,
        },
        skip: parseInt(skip.toString(), 10), // 정수 변환
        take: parseInt(limit.toString(), 10), // 정수 변환
      }),
      this.prisma.follow.count({
        where: {
          follower_id: userId,
          deleted_at: null,
        },
      }),
    ]);

    return {
      data: following,
      total: totalCount,
      page,
      limit,
    };
  }
}
