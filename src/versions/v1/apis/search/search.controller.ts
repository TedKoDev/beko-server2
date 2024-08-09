import { Controller, Get, Query } from '@nestjs/common';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchService } from './search.service';

@Controller({
  path: 'search',
  version: '1',
})
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(@Query() queryDto: SearchQueryDto) {
    // 통합 검색: 게시글(제목/내용/카테고리), 게시글(태그), 유저
    return this.searchService.search(queryDto);
  }

  @Get('posts')
  async searchPosts(@Query() queryDto: SearchQueryDto) {
    // 게시글 검색: 제목, 내용, 카테고리
    return this.searchService.searchPosts(queryDto);
  }

  @Get('posts/tag')
  async searchPostsByTag(@Query() queryDto: SearchQueryDto) {
    // 게시글 검색: 태그
    return this.searchService.searchPostsByTag(queryDto);
  }

  @Get('users')
  async searchUsers(@Query() queryDto: SearchQueryDto) {
    // 유저 검색
    return this.searchService.searchUsers(queryDto);
  }
}
