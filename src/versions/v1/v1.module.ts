import { Module } from '@nestjs/common';

import { AuthModule } from './apis/auth';
import { CommentsModule } from './apis/comments';
import { InquiryModule } from './apis/inquiry';
import { LikesModule } from './apis/likes';
import { PostsModule } from './apis/posts';
import { UserModule } from './apis/user';

@Module({
  imports: [
    InquiryModule,
    AuthModule,
    UserModule,
    PostsModule,
    CommentsModule,
    LikesModule,
  ],
})
export class V1Module {}
