import { Auth } from '@/decorators';
import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { FollowService } from './follow.service';

@Controller({
  path: 'follow',
  version: '1',
})
export class FollowController {
  constructor(private readonly followService: FollowService) {}
  @Auth(['ANY'])
  @Post(':userId')
  async toggleFollowUser(@Param('userId') userId: number, @Req() req: any) {
    const followerId = req.user.userId;

    if (followerId === userId) {
      throw new BadRequestException('You cannot follow yourself.');
    }

    return this.followService.toggleFollowUser(followerId, userId);
  }
  @Auth(['ANY'])
  @Get('followers/:userId')
  async getFollowers(
    @Param('userId') userId: number,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.followService.getFollowers(userId, paginationQuery);
  }
  @Auth(['ANY'])
  @Get('following/:userId')
  async getFollowing(
    @Param('userId') userId: number,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.followService.getFollowing(userId, paginationQuery);
  }
}
