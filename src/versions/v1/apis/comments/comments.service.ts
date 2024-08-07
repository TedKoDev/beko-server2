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
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private mediaService: MediaService,
    private pointsService: PointsService,
  ) {}

  /**
   * 댓글 생성 메서드
   * @param userId 사용자 ID
   * @param createCommentDto 댓글 생성 DTO
   * @returns 생성된 댓글
   */
  async create(userId: number, createCommentDto: CreateCommentDto) {
    // 댓글 생성
    const comment = await this.prisma.comment.create({
      data: {
        post_id: createCommentDto.postId,
        user_id: userId,
        content: createCommentDto.content,
        parent_comment_id: createCommentDto.parentCommentId,
      },
    });

    // 댓글 생성 시 post 테이블의 comments 필드 증가
    await this.prisma.post.update({
      where: { post_id: createCommentDto.postId },
      data: { comments: { increment: 1 } },
    });

    // 미디어 생성
    if (createCommentDto.media && createCommentDto.media.length > 0) {
      const mediaData = createCommentDto.media.map((media) => ({
        ...media,
        commentId: comment.comment_id,
      }));
      await this.mediaService.createMedia(mediaData);
    }

    return comment;
  }

  /**
   * 댓글 목록 조회 메서드
   * @param postId 게시글 ID
   * @param paginationQuery 페이지네이션 정보
   * @returns 댓글 목록 및 페이지네이션 정보
   */
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
          User: {
            select: {
              username: true,
              profile_picture_url: true,
            },
          },
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

  /**
   * 특정 댓글 조회 메서드
   * @param id 댓글 ID
   * @returns 조회된 댓글
   */
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
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  /**
   * 댓글 수정 메서드
   * @param id 댓글 ID
   * @param userId 사용자 ID
   * @param updateCommentDto 댓글 수정 DTO
   * @returns 수정된 댓글
   */
  async update(id: number, userId: number, updateCommentDto: UpdateCommentDto) {
    // 댓글 존재 여부 확인
    const comment = await this.prisma.comment.findUnique({
      where: { comment_id: id, deleted_at: null },
    });

    if (!comment) {
      throw new ForbiddenException('Comment not found');
    }

    // 댓글 작성자 또는 관리자 여부 확인
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

    // 댓글 수정
    const updatedComment = await this.prisma.comment.update({
      where: { comment_id: id },
      data: {
        content: updateCommentDto.content,
        updated_at: new Date(),
      },
    });

    // 기존 미디어 삭제
    await this.mediaService.deleteMediaByCommentId(updatedComment.comment_id);

    // 새로운 미디어 추가
    if (updateCommentDto.media && updateCommentDto.media.length > 0) {
      const newMedia = updateCommentDto.media.map((media) => ({
        ...media,
        commentId: updatedComment.comment_id,
      }));
      await this.mediaService.createMedia(newMedia as CreateMediaDto[]);
    }

    return updatedComment;
  }

  /**
   * 댓글 삭제 메서드
   * @param id 댓글 ID
   * @param userId 사용자 ID
   * @param userRole 사용자 역할
   * @returns 삭제된 댓글
   */
  async remove(id: number, userId: number, userRole: ROLE) {
    // 댓글 존재 여부 확인
    const comment = await this.prisma.comment.findUnique({
      where: { comment_id: id, deleted_at: null },
    });

    if (!comment) {
      throw new ForbiddenException('Comment not found');
    }

    // 답변으로 선택된 댓글인 경우 관리자만 삭제 가능
    if (comment.isSelected && userRole !== ROLE.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to delete a selected answer',
      );
    }

    // 댓글 작성자 또는 관리자 여부 확인
    if (comment.user_id !== userId && userRole !== ROLE.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to delete this comment',
      );
    }

    // 기존 미디어 삭제
    await this.mediaService.deleteMediaByCommentId(comment.comment_id);

    // 댓글 삭제 시 post 테이블의 comments 필드 감소
    await this.prisma.post.update({
      where: { post_id: comment.post_id },
      data: { comments: { decrement: 1 } },
    });

    // 댓글 삭제
    return this.prisma.comment.update({
      where: { comment_id: id },
      data: {
        deleted_at: new Date(),
        status: 'DELETED',
      },
    });
  }

  /**
   * 댓글을 답변으로 선택 메서드
   * @param commentId 댓글 ID
   * @param userId 사용자 ID
   * @returns 답변 선택 결과
   */
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
      // 답변 작성자 포인트 증가
      await prisma.users.update({
        where: { user_id: comment.user_id },
        data: { points: { increment: question.points } },
      });

      // 포인트 변경 내역 추가
      await prisma.point.create({
        data: {
          user_id: comment.user_id,
          points_change: question.points,
          change_reason: 'Answer selected',
        },
      });

      // 답변으로 선택된 댓글 업데이트
      await prisma.comment.update({
        where: { comment_id: commentId },
        data: { isSelected: true },
      });

      // 질문 상태 업데이트
      await prisma.post_Question.update({
        where: { post_id: comment.post_id },
        data: { isAnswered: true },
      });
    });

    return { message: 'Answer selected successfully' };
  }
}
