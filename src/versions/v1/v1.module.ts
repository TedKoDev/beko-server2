import { Module } from '@nestjs/common';

import { AuthModule } from './apis/auth';
import { CommentsModule } from './apis/comments';
import { FollowModule } from './apis/follow';
import { InquiryModule } from './apis/inquiry';
import { LikesModule } from './apis/likes';
import { PointsModule } from './apis/point';
import { PostsModule } from './apis/posts';
import { UserModule } from './apis/user';

@Module({
  imports: [
    InquiryModule,
    AuthModule,
    UserModule,
    PostsModule,
    CommentsModule,
    FollowModule,
    PointsModule,
    LikesModule,
  ],
})
export class V1Module {}
