// src/posts/posts.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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

  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  // pagination 적용
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.postsService.findAll({ page, limit });
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    await this.postsService.incrementViewCount(+id);
    return this.postsService.findOne(+id);
  }

  // @Auth(['ANY']) 추가해서 작업하기 ㅣ
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    // const userId = req.user.id; // 인증된 사용자 정보를 가져옴

    const userId = 1; // 임시로 사용자 ID를 1로 설정
    return this.postsService.update(+id, userId, updatePostDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.postsService.remove(+id);
  // }
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}
