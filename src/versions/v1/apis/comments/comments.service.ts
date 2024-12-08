import { PrismaService } from '@/prisma/postsql-prisma.service';
import { ROLE } from '@/types/v1';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMediaDto } from '../media/dto';
import { MediaService } from '../media/media.service';
import { NotificationService } from '../notification/notification.service';
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
    private readonly notificationService: NotificationService,
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

    const post = await this.prisma.post.findUnique({
      where: { post_id: createCommentDto.postId },
    });
    if (post && post.user_id && post.user_id !== userId) {
      const user = await this.prisma.users.findUnique({
        where: { user_id: post.user_id },
      });
      if (user && user.expo_push_token) {
        await this.notificationService.sendPushNotification(
          user.expo_push_token,
          `새 댓글이 달렸습니다: ${createCommentDto.content}`,
        );
      }
    }

    if (createCommentDto.media && createCommentDto.media.length > 0) {
      const mediaData = createCommentDto.media.map((media) => ({
        ...media,
        commentId: comment.comment_id,
      }));
      await this.mediaService.createMedia(mediaData);
    }

    return comment;
  }

  async findAll(paginationQuery: PaginationQueryDto, currentUserId: number) {
    const { page = 1, limit = 10, sort = 'latest', postId } = paginationQuery;
    const skip = (page - 1) * limit;

    // 포스트 정보 조회 추가
    const post = await this.prisma.post.findUnique({
      where: { post_id: postId },
      select: {
        post_id: true,
        user_id: true,
        type: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

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
          media: true,
          user: {
            include: {
              country: true,
            },
          },
          childComments: {
            where: { deleted_at: null },
            take: 3,
            orderBy: { created_at: 'desc' },
            include: {
              media: true,
              user: {
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

    const commentsWithLikes = await Promise.all(
      comments.map(async (comment) => {
        const userLikedComment = await this.prisma.commentLike.findFirst({
          where: {
            user_id: currentUserId,
            comment_id: comment.comment_id,
            deleted_at: null,
          },
        });

        return {
          ...comment,
          user_liked: !!userLikedComment,
          likes_count: await this.prisma.commentLike.count({
            where: {
              comment_id: comment.comment_id,
              deleted_at: null,
            },
          }),
        };
      }),
    );

    return {
      post_user_id: post.user_id,
      post_type: post.type,
      data: commentsWithLikes,
      total: totalCount,
      page,
      limit,
    };
  }

  async findOne(id: number, currentUserId: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { comment_id: id, deleted_at: null },
      include: {
        media: true,
        user: {
          select: {
            username: true,
            profile_picture_url: true,
          },
        },
        childComments: {
          where: { deleted_at: null },
          take: 3,
          orderBy: { created_at: 'desc' },
          include: {
            media: true,
            user: {
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

    const userLikedComment = await this.prisma.commentLike.findFirst({
      where: {
        user_id: currentUserId,
        comment_id: comment.comment_id,
        deleted_at: null,
      },
    });

    return {
      ...comment,
      user_liked: !!userLikedComment,
    };
  }

  async findReplies(commentId: number, paginationQuery: PaginationQueryDto) {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [replies, totalCount] = await Promise.all([
      this.prisma.comment.findMany({
        where: { parent_comment_id: commentId, deleted_at: null },
        include: {
          media: true,
          user: {
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

    return {
      data: replies,
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
    const comment = await this.prisma.comment.findUnique({
      where: { comment_id: commentId },
      include: {
        post: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.parent_comment_id !== null) {
      throw new BadRequestException('Cannot select a reply as an answer');
    }

    const question = await this.prisma.post_question.findUnique({
      where: { post_id: comment.post_id },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (comment.post.user_id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to select the answer for this question',
      );
    }

    if (comment.user_id === userId) {
      throw new ForbiddenException(
        'You cannot select your own comment as the answer',
      );
    }

    const existingSelectedComment = await this.prisma.comment.findFirst({
      where: {
        post_id: comment.post_id,
        isSelected: true,
      },
    });

    if (existingSelectedComment) {
      throw new BadRequestException('Answer has already been selected');
    }

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

      await prisma.post_question.update({
        where: { post_id: comment.post_id },
        data: { isAnswered: true },
      });
    });

    return { message: 'Answer selected successfully' };
  }

  async answerConsultation(
    teacherId: number,
    postId: number,
    content: string,
    commentId: number,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const consultation = await tx.post_consultation.findFirst({
        where: {
          post_id: postId,
          status: 'PENDING',
          deleted_at: null,
        },
        include: {
          post: {
            include: {
              category: true,
            },
          },
        },
      });

      if (!consultation) {
        throw new NotFoundException(
          'Consultation not found or already answered',
        );
      }

      // 기존 댓글이 있는지 확인
      const existingComment = await tx.comment.findUnique({
        where: { comment_id: commentId },
      });

      if (!existingComment) {
        throw new NotFoundException('Comment not found');
      }

      // 댓글 업데이트만 수행
      await tx.comment.update({
        where: { comment_id: commentId },
        data: {
          content: content,
          isSelected: true,
          updated_at: new Date(),
        },
      });

      // 상담 상태 업데이트
      await tx.post_consultation.update({
        where: { consultation_id: consultation.consultation_id },
        data: {
          teacher_id: teacherId,
          status: 'COMPLETED',
          completed_at: new Date(),
        },
      });

      // 선생님에게 ���인트 지급
      await tx.users.update({
        where: { user_id: teacherId },
        data: { points: { increment: consultation.price } },
      });

      // 포인트 내역 추가
      await tx.point.create({
        data: {
          user_id: teacherId,
          points_change: consultation.price,
          change_reason: 'Consultation answered',
        },
      });

      return { message: 'Consultation answered successfully' };
    });
  }
}
