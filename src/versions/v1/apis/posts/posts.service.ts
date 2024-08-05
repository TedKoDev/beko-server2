import { PrismaService } from '@/prisma/postsql-prisma.service';
import { ROLE } from '@/types/v1';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PostType, Prisma } from '@prisma/client';
import { MediaService } from '../media';
import { CreateMediaDto } from '../media/dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private mediaService: MediaService,
  ) {}

  async create(userId: number, createPostDto: CreatePostDto) {
    const postCreateInput: Prisma.PostCreateInput = {
      title: createPostDto.title,
      content: createPostDto.content,
      type: createPostDto.type as PostType, // 타입 캐스팅
      User: { connect: { user_id: userId } },
      Category: { connect: { category_id: createPostDto.categoryId } },
    };
    const post = await this.prisma.post.create({ data: postCreateInput });

    // 미디어 정보가 있는 경우 생성
    if (createPostDto.media && createPostDto.media.length > 0) {
      const mediaData = createPostDto.media.map((media) => ({
        ...media,
        postId: post.post_id,
      }));
      await this.mediaService.createMedia(mediaData);
    }

    return post;
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
      type: updatePostDto.type
        ? { set: updatePostDto.type as PostType }
        : undefined,
      Category: updatePostDto.categoryId
        ? { connect: { category_id: updatePostDto.categoryId } }
        : undefined,
    };

    const updatedPost = await this.prisma.post.update({
      where: { post_id: id },
      data: postUpdateInput,
    });

    // 기존 미디어 삭제
    await this.mediaService.deleteMediaByPostId(updatedPost.post_id);

    // 새로운 미디어 추가
    if (updatePostDto.media && updatePostDto.media.length > 0) {
      const newMedia: CreateMediaDto[] = updatePostDto.media.map((media) => ({
        mediaUrl: media.mediaUrl,
        mediaType: media.mediaType,
        postId: updatedPost.post_id,
      }));
      await this.mediaService.createMedia(newMedia);
    }

    return updatedPost;
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

  async remove(postId: number, userId: number, userRole: ROLE) {
    // 게시물을 조회하여 작성자 확인
    const post = await this.prisma.post.findUnique({
      where: { post_id: postId },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    // 관리자가 아닌 경우, 작성자 본인만 삭제할 수 있도록 제한
    if (userRole !== ROLE.ADMIN && post.user_id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this post',
      );
    }

    return this.prisma.post.update({
      where: { post_id: postId },
      data: { deleted_at: new Date() }, // deleted_at 필드 업데이트
    });
  }

  // 게시물 id로 게시물 조회
  async findOne(id: number) {
    return this.prisma.post.findUnique({ where: { post_id: id } });
  }
  // 게시물 조회수 증가
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
