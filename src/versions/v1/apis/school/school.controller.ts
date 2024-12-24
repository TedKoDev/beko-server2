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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommentsService } from '../comments/comments.service';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { PaginationQueryDto } from '../comments/dto/pagination-query.dto';
import { CreateSchoolDto } from './dto/create-school.dto';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { SchoolService } from './school.service';

@ApiTags('Korean Schools')
@Controller({
  path: 'schools',
  version: '1',
})
export class SchoolController {
  constructor(
    private readonly schoolService: SchoolService,
    private readonly commentsService: CommentsService,
  ) {}

  @Auth(['ADMIN'])
  @Post()
  @ApiOperation({ summary: 'Create a new school' })
  create(@Body() createSchoolDto: CreateSchoolDto) {
    return this.schoolService.create(createSchoolDto);
  }

  @Auth(['ANY'])
  @Get()
  @ApiOperation({ summary: 'Get all schools with optional filters' })
  findAll(@Query() pagination: PaginationDto) {
    return this.schoolService.findAll(pagination);
  }

  @Auth(['ANY'])
  @Get(':id')
  @ApiOperation({ summary: 'Get a school by id' })
  findOne(@Param('id') id: string) {
    return this.schoolService.findOne(+id);
  }

  @Auth(['ADMIN'])
  @Patch(':id')
  @ApiOperation({ summary: 'Update a school' })
  update(@Param('id') id: string, @Body() updateSchoolDto: UpdateSchoolDto) {
    return this.schoolService.update(+id, updateSchoolDto);
  }

  @Auth(['ADMIN'])
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a school' })
  remove(@Param('id') id: string) {
    return this.schoolService.remove(+id);
  }

  @Auth(['ANY'])
  @Get(':id/comments')
  @ApiOperation({ summary: 'Get comments for a school' })
  async getComments(
    @Param('id') id: string,
    @Query() paginationQuery: PaginationQueryDto,
    @Req() req: { user: { userId: number } },
  ) {
    const userId = req.user.userId;
    return this.commentsService.findAll(
      { ...paginationQuery, schoolId: +id },
      userId,
    );
  }

  @Auth(['ANY'])
  @Post(':id/comments')
  @ApiOperation({ summary: 'Add a comment to a school' })
  async addComment(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: { user: { userId: number } },
  ) {
    const userId = req.user.userId;
    return this.commentsService.create(userId, {
      ...createCommentDto,
      schoolId: +id,
    });
  }
}
