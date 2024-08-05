// src/posts/posts.controller.ts
import { Auth } from '@/decorators';
import { ROLE } from '@/types/v1';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@Controller({
  path: 'posts',
  version: '1',
})
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Auth(['ANY'])
  @Post()
  create(
    @Body() createPostDto: CreatePostDto,
    @Req() req: { user: { userId: number } }, // 인증된 사용자 정보를 가져옴
  ) {
    const userId = req.user.userId; // 사용자 ID를 추출
    return this.postsService.create(userId, createPostDto); // userId를 전달
  }

  // pagination 적용
  @Auth(['ANY'])
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.postsService.findAll({ page, limit });
  }

  @Auth(['ANY'])
  @Get(':id')
  async findOne(@Param('id') id: string) {
    await this.postsService.incrementViewCount(+id);
    return this.postsService.findOne(+id);
  }

  @Auth(['ANY'])
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: { user: { userId: number; role: ROLE } },
  ) {
    const userId = req.user.userId; // 인증된 사용자 정보를 가져옴
    return this.postsService.update(+id, userId, updatePostDto);
  }

  @Auth(['ANY'])
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: { user: { userId: number; role: ROLE } },
  ) {
    return this.postsService.remove(+id, req.user.userId, req.user.role);
  }
}
