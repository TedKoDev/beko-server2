import { PrismaService } from '@/prisma/postsql-prisma.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
      type: createPostDto.type,
      User: { connect: { user_id: userId } },
      Category: { connect: { category_id: createPostDto.categoryId } },
    };

    const post = await this.prisma.post.create({ data: postCreateInput });

    switch (createPostDto.type) {
      case PostType.GENERAL:
        await this.prisma.post_General.create({
          data: {
            post_id: post.post_id,
            title: createPostDto.title,
            content: createPostDto.content,
          },
        });
        break;
      case PostType.COLUMN:
        await this.prisma.post_Column.create({
          data: {
            post_id: post.post_id,
            title: createPostDto.title,
            content: createPostDto.content,
          },
        });
        break;
      case PostType.QUESTION:
        await this.prisma.post_Question.create({
          data: {
            post_id: post.post_id,
            title: createPostDto.title,
            content: createPostDto.content,
            points: createPostDto.points,
          },
        });
        break;
      default:
        throw new Error('Invalid post type');
    }

    if (createPostDto.media && createPostDto.media.length > 0) {
      const mediaData = createPostDto.media.map((media) => ({
        ...media,
        postId: post.post_id,
      }));
      await this.mediaService.createMedia(mediaData);
    }

    if (createPostDto.tags && createPostDto.tags.length > 0) {
      await this.handleTags(post.post_id, createPostDto.tags, false);
    }

    return post;
  }

  async update(id: number, userId: number, updatePostDto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({
      where: { post_id: id },
      include: { User: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

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

    switch (updatePostDto.type) {
      case PostType.GENERAL:
        await this.prisma.post_General.update({
          where: { post_id: id },
          data: {
            title: updatePostDto.title,
            content: updatePostDto.content,
          },
        });
        break;
      case PostType.COLUMN:
        await this.prisma.post_Column.update({
          where: { post_id: id },
          data: {
            title: updatePostDto.title,
            content: updatePostDto.content,
          },
        });
        break;
      case PostType.QUESTION:
        await this.prisma.post_Question.update({
          where: { post_id: id },
          data: {
            title: updatePostDto.title,
            content: updatePostDto.content,
            points: updatePostDto.points,
          },
        });
        break;
      default:
        throw new Error('Invalid post type');
    }

    await this.mediaService.deleteMediaByPostId(updatedPost.post_id);

    if (updatePostDto.media && updatePostDto.media.length > 0) {
      const newMedia: CreateMediaDto[] = updatePostDto.media.map((media) => ({
        mediaUrl: media.mediaUrl,
        mediaType: media.mediaType,
        postId: updatedPost.post_id,
      }));
      await this.mediaService.createMedia(newMedia);
    }

    await this.prisma.postTag.deleteMany({ where: { post_id: id } });

    if (updatePostDto.tags && updatePostDto.tags.length > 0) {
      await this.handleTags(updatedPost.post_id, updatePostDto.tags, false);
    }

    return updatedPost;
  }

  async handleTags(postId: number, tags: string[], isAdminTag: boolean) {
    for (const tagName of tags) {
      let tag = await this.prisma.tag.findUnique({
        where: { tag_name: tagName },
      });

      if (tag) {
        await this.prisma.tag.update({
          where: { tag_id: tag.tag_id },
          data: { usage_count: { increment: 1 } },
        });
      } else {
        tag = await this.prisma.tag.create({
          data: {
            tag_name: tagName,
            is_admin_tag: isAdminTag,
            usage_count: 1,
          },
        });
      }

      await this.prisma.postTag.create({
        data: {
          post_id: postId,
          tag_id: tag.tag_id,
        },
      });
    }
  }

  async findAll(paginationQuery: { page: number; limit: number }) {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [posts, totalCount] = await Promise.all([
      this.prisma.post.findMany({
        where: {
          status: 'PUBLIC',
          deleted_at: null,
        },
        skip,
        take: limit,
      }),
      this.prisma.post.count({
        where: {
          status: 'PUBLIC',
          deleted_at: null,
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

  async remove(postId: number, userId: number, userRole: string) {
    const post = await this.prisma.post.findUnique({
      where: { post_id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (userRole !== 'ADMIN' && post.user_id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this post',
      );
    }

    return this.prisma.post.update({
      where: { post_id: postId },
      data: { deleted_at: new Date() },
    });
  }

  async findOne(id: number) {
    return this.prisma.post.findUnique({ where: { post_id: id } });
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
