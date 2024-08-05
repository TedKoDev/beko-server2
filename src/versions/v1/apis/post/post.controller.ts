import { Controller, Get, Inject, Post } from '@nestjs/common';
import { POST_SERVICE_TOKEN, PostService } from './post.service';

@Controller({
  path: 'post',
  version: '1',
})
export class PostController {
  constructor(
    @Inject(POST_SERVICE_TOKEN)
    private readonly postService: PostService,
  ) {}

  @Post('/')
  async createPost() {
    console.log('hi');
    return this.postService.create();
  }

  @Get('/')
  async getPosts() {
    console.log('hi');
  }
}
