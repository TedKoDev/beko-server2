import { Module } from '@nestjs/common';

import { AdBannerModule } from './apis/ad-banner';
import { AdminBlockModule } from './apis/admin-block';
import { AuthModule } from './apis/auth';
import { CommentsModule } from './apis/comments';
import { FollowModule } from './apis/follow';
import { InquiryModule } from './apis/inquiry';
import { LevelThresholdModule } from './apis/level';
import { LikesModule } from './apis/likes';
import { PointsModule } from './apis/point';
import { PostsModule } from './apis/posts';
import { ReportModule } from './apis/report';
import { SearchModule } from './apis/search';
import { UserModule } from './apis/user';
import { UserBlockModule } from './apis/userblock';

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
    SearchModule,
    ReportModule,
    UserBlockModule,
    AdminBlockModule,
    LevelThresholdModule,
    AdBannerModule,
  ],
})
export class V1Module {}
