// src/comments/comments.service.ts
import { PrismaService } from '@/prisma';
import { ROLE } from '@/types/v1';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateMediaDto } from '../media/dto';
import { MediaService } from '../media/media.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private mediaService: MediaService,
  ) {}

  async create(userId: number, createCommentDto: CreateCommentDto) {
    const comment = await this.prisma.comment.create({
      data: {
        post_id: createCommentDto.postId,
        user_id: userId,
        content: createCommentDto.content,
        parent_comment_id: createCommentDto.parentCommentId,
      },
    });

    if (createCommentDto.media && createCommentDto.media.length > 0) {
      const mediaData = createCommentDto.media.map((media) => ({
        ...media,
        commentId: comment.comment_id,
      }));
      await this.mediaService.createMedia(mediaData);
    }

    return comment;
  }

  async findAll(
    postId: number,
    paginationQuery: { page: number; limit: number },
  ) {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [comments, totalCount] = await Promise.all([
      this.prisma.comment.findMany({
        where: { post_id: postId, deleted_at: null },
        include: {
          Media: true,
        },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({
        where: { post_id: postId, deleted_at: null },
      }),
    ]);

    return {
      data: comments,
      total: totalCount,
      page,
      limit,
    };
  }

  async findOne(id: number) {
    return this.prisma.comment.findUnique({
      where: { comment_id: id, deleted_at: null },
      include: {
        Media: true,
      },
    });
  }

  async update(id: number, userId: number, updateCommentDto: UpdateCommentDto) {
    const comment = await this.prisma.comment.findUnique({
      where: { comment_id: id, deleted_at: null },
    });

    if (!comment) {
      throw new ForbiddenException('Comment not found');
    }

    if (comment.user_id !== userId) {
      const user = await this.prisma.users.findUnique({
        where: { user_id: userId },
      });
      if (user.role !== ROLE.ADMIN) {
        throw new ForbiddenException(
          'You do not have permission to update this comment',
        );
      }
    }

    const updatedComment = await this.prisma.comment.update({
      where: { comment_id: id },
      data: {
        content: updateCommentDto.content,
        updated_at: new Date(),
      },
    });

    await this.mediaService.deleteMediaByCommentId(updatedComment.comment_id);

    if (updateCommentDto.media && updateCommentDto.media.length > 0) {
      const newMedia = updateCommentDto.media.map((media) => ({
        ...media,
        commentId: updatedComment.comment_id,
      }));
      await this.mediaService.createMedia(newMedia as CreateMediaDto[]);
    }

    return updatedComment;
  }

  async remove(id: number, userId: number, userRole: ROLE) {
    const comment = await this.prisma.comment.findUnique({
      where: { comment_id: id, deleted_at: null },
    });

    if (!comment) {
      throw new ForbiddenException('Comment not found');
    }

    if (comment.user_id !== userId && userRole !== ROLE.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to delete this comment',
      );
    }

    await this.mediaService.deleteMediaByCommentId(comment.comment_id);

    return this.prisma.comment.update({
      where: { comment_id: id },
      data: { deleted_at: new Date() },
    });
  }
}
