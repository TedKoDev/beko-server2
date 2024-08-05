import { PrismaService } from '@/prisma/postsql-prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto) {
    const postCreateInput: Prisma.PostCreateInput = {
      title: createPostDto.title,
      content: createPostDto.content,
      type: createPostDto.type,
      User: { connect: { user_id: createPostDto.userId } },
      Category: { connect: { category_id: createPostDto.categoryId } },
    };
    return this.prisma.post.create({ data: postCreateInput });
  }

  //pagination 적용
  async findAll(paginationQuery: { page: number; limit: number }) {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [posts, totalCount] = await Promise.all([
      this.prisma.post.findMany({
        where: {
          status: 'PUBLIC',
          deleted_at: null, // 삭제되지 않은 게시물만 가져오기
        },
        skip,
        take: limit,
      }),
      this.prisma.post.count({
        where: {
          status: 'PUBLIC',
          deleted_at: null, // 삭제되지 않은 게시물만 카운트
        },
      }),
    ]);

    return {
      data: posts,
      total: totalCount,
      page,
      limit,
    };
  }

  async findOne(id: number) {
    return this.prisma.post.findUnique({ where: { post_id: id } });
  }

  async update(id: number, userId: number, updatePostDto: UpdatePostDto) {
    // 게시물 정보 가져오기
    const post = await this.prisma.post.findUnique({
      where: { post_id: id },
      include: { User: true },
    });

    // 작성자 확인 및 사용자 역할 확인
    if (post.user_id !== userId) {
      const user = await this.prisma.users.findUnique({
        where: { user_id: userId },
      });
      if (user.role !== 'ADMIN') {
        throw new ForbiddenException(
          'You do not have permission to update this post',
        );
      }
    }

    const postUpdateInput: Prisma.PostUpdateInput = {
      title: updatePostDto.title,
      content: updatePostDto.content,
      type: { set: updatePostDto.type },
      User: { connect: { user_id: updatePostDto.userId } },
      Category: { connect: { category_id: updatePostDto.categoryId } },
    };
    return this.prisma.post.update({
      where: { post_id: id },
      data: postUpdateInput,
    });
  }

  // async remove(id: number) {
  //   return this.prisma.post.delete({ where: { post_id: id } });
  // }

  async remove(id: number) {
    return this.prisma.post.update({
      where: { post_id: id },
      data: { deleted_at: new Date() }, // deleted_at 필드 업데이트
    });
  }
  async incrementViewCount(id: number) {
    return this.prisma.post.update({
      where: { post_id: id },
      data: {
        views: {
          increment: 1,
        },
      },
    });
  }
}
