import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateLikeDto {
  @IsInt()
  @IsNotEmpty()
  postId: number;
}

export class CreateCommentLikeDto {
  @IsInt()
  @IsNotEmpty()
  commentId: number;
}
