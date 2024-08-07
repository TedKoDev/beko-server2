// src/posts/posts.controller.ts
import { Auth } from '@/decorators';
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
import { PaginationQueryDto } from './dto/pagination-query.dto';
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

  @Auth(['ANY'])
  @Get()
  async findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.postsService.findAll(paginationQuery);
  }

  @Auth(['ANY'])
  @Get(':id')
  async findOne(@Param('id') id: number) {
    await this.postsService.incrementViewCount(id);
    return this.postsService.findOne(id);
  }

  @Auth(['ANY'])
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: { user: { userId: number; role: string } },
  ) {
    const userId = req.user.userId; // 인증된 사용자 정보를 가져옴
    return this.postsService.update(id, userId, updatePostDto);
  }

  @Auth(['ANY'])
  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @Req() req: { user: { userId: number; role: string } },
  ) {
    return this.postsService.remove(id, req.user.userId, req.user.role);
  }
}
