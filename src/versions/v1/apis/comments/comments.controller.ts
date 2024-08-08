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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller({
  path: 'comments',
  version: '1',
})
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Auth(['ANY'])
  @Post()
  create(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: { user: { userId: number } },
  ) {
    const userId = req.user.userId; // 인증된 사용자 정보를 가져옴
    return this.commentsService.create(userId, createCommentDto); // userId를 전달
  }

  @Auth(['ANY'])
  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.commentsService.findAll(paginationQuery);
  }

  @Auth(['ANY'])
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(+id);
  }

  @Auth(['ANY'])
  @Get(':id/replies')
  findReplies(
    @Param('id') id: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.commentsService.findReplies(+id, paginationQuery);
  }

  @Auth(['ANY'])
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req: { user: { userId: number; role: ROLE } },
  ) {
    const userId = req.user.userId; // 인증된 사용자 정보를 가져옴
    return this.commentsService.update(+id, userId, updateCommentDto);
  }

  @Auth(['ANY'])
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req: { user: { userId: number; role: ROLE } },
  ) {
    return this.commentsService.remove(+id, req.user.userId, req.user.role);
  }

  @Auth(['ANY'])
  @Patch(':id/select-as-answer')
  selectAsAnswer(
    @Param('id') id: string,
    @Req() req: { user: { userId: number } },
  ) {
    const userId = req.user.userId; // 인증된 사용자 정보를 가져옴
    return this.commentsService.selectCommentAsAnswer(+id, userId); // commentId와 userId를 전달
  }
}
