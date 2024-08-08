import { PrismaService } from '@/prisma';
import { ROLE } from '@/types/v1';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMediaDto } from '../media/dto';
import { MediaService } from '../media/media.service';
import { PointsService } from '../point/points.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private mediaService: MediaService,
    private pointsService: PointsService,
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

    await this.prisma.post.update({
      where: { post_id: createCommentDto.postId },
      data: { comments: { increment: 1 } },
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

  async findAll(paginationQuery: PaginationQueryDto) {
    const { page = 1, limit = 10, sort = 'latest', postId } = paginationQuery;
    const skip = (page - 1) * limit;

    const orderBy = [];
    if (sort === 'latest') {
      orderBy.push({ created_at: 'desc' });
    } else if (sort === 'oldest') {
      orderBy.push({ created_at: 'asc' });
    } else if (sort === 'popular') {
      orderBy.push({ likes: 'desc' });
    }

    const [comments, totalCount] = await Promise.all([
      this.prisma.comment.findMany({
        where: { post_id: postId, deleted_at: null, parent_comment_id: null },
        include: {
          Media: true,
          User: {
            select: {
              username: true,
              profile_picture_url: true,
            },
          },
          ChildComments: {
            where: { deleted_at: null },
            take: 3,
            orderBy: { created_at: 'desc' },
            include: {
              Media: true,
              User: {
                select: {
                  username: true,
                  profile_picture_url: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.comment.count({
        where: { post_id: postId, deleted_at: null, parent_comment_id: null },
      }),
    ]);

    const transformedComments = comments.map((comment) => ({
      comment_id: comment.comment_id,
      post_id: comment.post_id,
      user_id: comment.user_id,
      content: comment.content,
      parent_comment_id: comment.parent_comment_id,
      status: comment.status,
      likes: comment.likes,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      deleted_at: comment.deleted_at,
      isSelected: comment.isSelected,
      media: comment.Media,
      user: comment.User,
      childComments: comment.ChildComments.map((childComment) => ({
        comment_id: childComment.comment_id,
        post_id: childComment.post_id,
        user_id: childComment.user_id,
        content: childComment.content,
        parent_comment_id: childComment.parent_comment_id,
        status: childComment.status,
        likes: childComment.likes,
        created_at: childComment.created_at,
        updated_at: childComment.updated_at,
        deleted_at: childComment.deleted_at,
        isSelected: childComment.isSelected,
        media: childComment.Media,
        user: childComment.User,
      })),
    }));

    return {
      data: transformedComments,
      total: totalCount,
      page,
      limit,
    };
  }

  async findOne(id: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { comment_id: id, deleted_at: null },
      include: {
        Media: true,
        User: {
          select: {
            username: true,
            profile_picture_url: true,
          },
        },
        ChildComments: {
          where: { deleted_at: null },
          take: 3,
          orderBy: { created_at: 'desc' },
          include: {
            Media: true,
            User: {
              select: {
                username: true,
                profile_picture_url: true,
              },
            },
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const transformedComment = {
      comment_id: comment.comment_id,
      post_id: comment.post_id,
      user_id: comment.user_id,
      content: comment.content,
      parent_comment_id: comment.parent_comment_id,
      status: comment.status,
      likes: comment.likes,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      deleted_at: comment.deleted_at,
      isSelected: comment.isSelected,
      media: comment.Media,
      user: comment.User,
      childComments: comment.ChildComments.map((childComment) => ({
        comment_id: childComment.comment_id,
        post_id: childComment.post_id,
        user_id: childComment.user_id,
        content: childComment.content,
        parent_comment_id: childComment.parent_comment_id,
        status: childComment.status,
        likes: childComment.likes,
        created_at: childComment.created_at,
        updated_at: childComment.updated_at,
        deleted_at: childComment.deleted_at,
        isSelected: childComment.isSelected,
        media: childComment.Media,
        user: childComment.User,
      })),
    };

    return transformedComment;
  }

  async findReplies(commentId: number, paginationQuery: PaginationQueryDto) {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [replies, totalCount] = await Promise.all([
      this.prisma.comment.findMany({
        where: { parent_comment_id: commentId, deleted_at: null },
        include: {
          Media: true,
          User: {
            select: {
              username: true,
              profile_picture_url: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.comment.count({
        where: { parent_comment_id: commentId, deleted_at: null },
      }),
    ]);

    const transformedReplies = replies.map((reply) => ({
      comment_id: reply.comment_id,
      post_id: reply.post_id,
      user_id: reply.user_id,
      content: reply.content,
      parent_comment_id: reply.parent_comment_id,
      status: reply.status,
      likes: reply.likes,
      created_at: reply.created_at,
      updated_at: reply.updated_at,
      deleted_at: reply.deleted_at,
      isSelected: reply.isSelected,
      media: reply.Media,
      user: reply.User,
    }));

    return {
      data: transformedReplies,
      total: totalCount,
      page,
      limit,
    };
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

    if (comment.isSelected && userRole !== ROLE.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to delete a selected answer',
      );
    }

    if (comment.user_id !== userId && userRole !== ROLE.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to delete this comment',
      );
    }

    await this.mediaService.deleteMediaByCommentId(comment.comment_id);

    await this.prisma.post.update({
      where: { post_id: comment.post_id },
      data: { comments: { decrement: 1 } },
    });

    return this.prisma.comment.update({
      where: { comment_id: id },
      data: {
        deleted_at: new Date(),
        status: 'DELETED',
      },
    });
  }

  async selectCommentAsAnswer(commentId: number, userId: number) {
    // 답변을 선택한 댓글 가져오기
    const comment = await this.prisma.comment.findUnique({
      where: { comment_id: commentId },
      include: {
        Post: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // 대댓글인 경우 선택되지 않도록 처리
    if (comment.parent_comment_id !== null) {
      throw new BadRequestException('Cannot select a reply as an answer');
    }

    // 질문 가져오기
    const question = await this.prisma.post_Question.findUnique({
      where: { post_id: comment.post_id },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // 답변을 선택한 사용자와 질문 작성자가 동일한지 확인
    if (comment.Post.user_id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to select the answer for this question',
      );
    }

    // 답변 작성자와 질문 작성자가 동일한지 확인
    if (comment.user_id === userId) {
      throw new ForbiddenException(
        'You cannot select your own comment as the answer',
      );
    }

    // 기존에 선택된 답변이 있는지 확인
    const existingSelectedComment = await this.prisma.comment.findFirst({
      where: {
        post_id: comment.post_id,
        isSelected: true,
      },
    });

    if (existingSelectedComment) {
      throw new BadRequestException('Answer has already been selected');
    }

    // 포인트를 답변 작성자에게 추가하고 질문 작성자의 포인트는 변경하지 않음
    await this.prisma.$transaction(async (prisma) => {
      await prisma.users.update({
        where: { user_id: comment.user_id },
        data: { points: { increment: question.points } },
      });

      await prisma.point.create({
        data: {
          user_id: comment.user_id,
          points_change: question.points,
          change_reason: 'Answer selected',
        },
      });

      await prisma.comment.update({
        where: { comment_id: commentId },
        data: { isSelected: true },
      });

      await prisma.post_Question.update({
        where: { post_id: comment.post_id },
        data: { isAnswered: true },
      });
    });

    return { message: 'Answer selected successfully' };
  }
}
