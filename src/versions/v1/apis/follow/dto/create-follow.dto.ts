import { IsInt } from 'class-validator';

export class CreateFollowDto {
  @IsInt()
  followerId: number;

  @IsInt()
  followingId: number;
}
