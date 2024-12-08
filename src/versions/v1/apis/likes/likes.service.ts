import { PrismaService } from '@/prisma/postsql-prisma.service';
import { Injectable } from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class LikesService {
  constructor(
    private readonly notificationService: NotificationService,
    private prisma: PrismaService,
  ) {}

  async togglePostLike(userId: number, postId: number) {
    const existingLike = await this.prisma.like.findFirst({
      where: { user_id: userId, post_id: postId },
    });

    if (existingLike) {
      if (existingLike.deleted_at) {
        await this.prisma.like.update({
          where: { like_id: existingLike.like_id },
          data: { deleted_at: null },
        });
        await this.prisma.post.update({
          where: { post_id: postId },
          data: { likes: { increment: 1 } },
        });
        // 좋아요가 추가될 때만 알림 전송
        const post = await this.prisma.post.findUnique({
          where: { post_id: postId },
        });

        if (post && post.user_id && post.user_id !== userId) {
          const user = await this.prisma.users.findUnique({
            where: { user_id: post.user_id },
          });
          if (user && user.expo_push_token) {
            await this.notificationService.sendPushNotification(
              user.expo_push_token,
              `게시글에 좋아요가 달렸습니다.`,
            );
          }
        }
      } else {
        await this.prisma.like.update({
          where: { like_id: existingLike.like_id },
          data: { deleted_at: new Date() },
        });
        await this.prisma.post.update({
          where: { post_id: postId },
          data: { likes: { decrement: 1 } },
        });
        // 좋아요가 취소될 때는 알림을 보내지 않음
      }
    } else {
      await this.prisma.like.create({
        data: {
          user_id: userId,
          post_id: postId,
        },
      });
      await this.prisma.post.update({
        where: { post_id: postId },
        data: { likes: { increment: 1 } },
      });
      // 좋아요가 추가될 때만 알림 전송
      const post = await this.prisma.post.findUnique({
        where: { post_id: postId },
      });

      if (post && post.user_id && post.user_id !== userId) {
        const user = await this.prisma.users.findUnique({
          where: { user_id: post.user_id },
        });
        if (user && user.expo_push_token) {
          await this.notificationService.sendPushNotification(
            user.expo_push_token,
            `게시글에 좋아요가 달렸습니다.`,
          );
        }
      }
    }

    return existingLike ? existingLike : null; // Return the like object if it exists
  }

  async toggleCommentLike(userId: number, commentId: number) {
    const existingLike = await this.prisma.commentLike.findFirst({
      where: { user_id: userId, comment_id: commentId },
    });

    if (existingLike) {
      if (existingLike.deleted_at) {
        await this.prisma.commentLike.update({
          where: { comment_like_id: existingLike.comment_like_id },
          data: { deleted_at: null },
        });
        await this.prisma.comment.update({
          where: { comment_id: commentId },
          data: { likes: { increment: 1 } },
        });
        // 좋아요가 추가될 때만 알림 전송
        const comment = await this.prisma.comment.findUnique({
          where: { comment_id: commentId },
        });

        if (comment && comment.user_id && comment.user_id !== userId) {
          const user = await this.prisma.users.findUnique({
            where: { user_id: comment.user_id },
          });
          if (user && user.expo_push_token) {
            await this.notificationService.sendPushNotification(
              user.expo_push_token,
              `댓글에 좋아요가 달렸습니다.`,
            );
          }
        }
      } else {
        await this.prisma.commentLike.update({
          where: { comment_like_id: existingLike.comment_like_id },
          data: { deleted_at: new Date() },
        });
        await this.prisma.comment.update({
          where: { comment_id: commentId },
          data: { likes: { decrement: 1 } },
        });
        // 좋아요가 취소될 때는 알림을 보내지 않음
      }
    } else {
      await this.prisma.commentLike.create({
        data: {
          user_id: userId,
          comment_id: commentId,
        },
      });
      await this.prisma.comment.update({
        where: { comment_id: commentId },
        data: { likes: { increment: 1 } },
      });
      // 좋아요가 추가될 때만 알림 전송
      const comment = await this.prisma.comment.findUnique({
        where: { comment_id: commentId },
      });

      if (comment && comment.user_id && comment.user_id !== userId) {
        const user = await this.prisma.users.findUnique({
          where: { user_id: comment.user_id },
        });
        if (user && user.expo_push_token) {
          await this.notificationService.sendPushNotification(
            user.expo_push_token,
            `댓글에 좋아요가 달렸습니다.`,
          );
        }
      }
    }

    return existingLike ? existingLike : null; // Return the like object if it exists
  }
}
