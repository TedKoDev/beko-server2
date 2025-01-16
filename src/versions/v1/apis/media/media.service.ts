// src/media/media.service.ts
import { PrismaService } from '@/prisma/postsql-prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async createMedia(media: CreateMediaDto[]) {
    return this.prisma.$transaction(async (tx) => {
      const mediaPromises = media.map((mediaItem) => {
        if (
          (mediaItem.postId && mediaItem.commentId) ||
          (!mediaItem.postId && !mediaItem.commentId)
        ) {
          throw new BadRequestException(
            'Either postId or commentId must be set, but not both.',
          );
        }

        return tx.media.create({
          data: {
            post_id: mediaItem.postId,
            comment_id: mediaItem.commentId,
            media_url: mediaItem.mediaUrl,
            media_type: mediaItem.mediaType,
          },
        });
      });

      return Promise.all(mediaPromises);
    });
  }

  async findMediaByPostId(postId: number) {
    return this.prisma.media.findMany({
      where: { post_id: postId, deleted_at: null },
    });
  }

  async findMediaByCommentId(commentId: number) {
    return this.prisma.media.findMany({
      where: { comment_id: commentId, deleted_at: null },
    });
  }

  async updateMedia(mediaId: number, updateMediaDto: UpdateMediaDto) {
    return this.prisma.$transaction(async (tx) => {
      const media = await tx.media.findUnique({
        where: { media_id: mediaId },
      });

      if (!media) {
        throw new BadRequestException('Media not found');
      }

      const { mediaUrl, mediaType } = updateMediaDto;
      return tx.media.update({
        where: { media_id: mediaId },
        data: {
          media_url: mediaUrl,
          media_type: mediaType,
          updated_at: new Date(),
        },
      });
    });
  }

  async deleteMedia(mediaId: number) {
    return this.prisma.$transaction(async (tx) => {
      const media = await tx.media.findUnique({
        where: { media_id: mediaId },
      });

      if (!media) {
        throw new BadRequestException('Media not found');
      }

      return tx.media.update({
        where: { media_id: mediaId },
        data: { deleted_at: new Date() },
      });
    });
  }

  async deleteMediaByPostId(postId: number) {
    return this.prisma.$transaction(async (tx) => {
      const mediaCount = await tx.media.count({
        where: { post_id: postId, deleted_at: null },
      });

      if (mediaCount === 0) {
        return { count: 0 };
      }

      return tx.media.updateMany({
        where: { post_id: postId },
        data: { deleted_at: new Date() },
      });
    });
  }

  async deleteMediaByCommentId(commentId: number) {
    return this.prisma.$transaction(async (tx) => {
      const mediaCount = await tx.media.count({
        where: { comment_id: commentId, deleted_at: null },
      });

      if (mediaCount === 0) {
        return { count: 0 };
      }

      return tx.media.updateMany({
        where: { comment_id: commentId },
        data: { deleted_at: new Date() },
      });
    });
  }
}
