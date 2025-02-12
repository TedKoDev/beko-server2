import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SlackService } from './apis/utils/slack/slack.service';

import { AdBannerModule } from './apis/ad-banner';
import { AdminBlockModule } from './apis/admin-block';
import { AdminDashboardModule } from './apis/admin-dashboard/admin-dashboard.module';
import { AppVersionModule } from './apis/app-version/app-version.module';
import { AuthModule } from './apis/auth';
import { CommentsModule } from './apis/comments';
import { CountryModule } from './apis/country/country.module';
import { EmailModule } from './apis/email';
import { FollowModule } from './apis/follow';
import { GamesModule } from './apis/games/games.module';
import { LevelThresholdModule } from './apis/level';
import { LikesModule } from './apis/likes';
import { LogsModule } from './apis/logsdata';
import { NotificationModule } from './apis/notification/notification.module';
import { PointsModule } from './apis/point';
import { PostsModule } from './apis/posts';
import { ReportModule } from './apis/report';
import { SchoolModule } from './apis/school/school.module';
import { SearchModule } from './apis/search';
import { UserModule } from './apis/user';
import { UserBlockModule } from './apis/userblock';
import { S3Module } from './apis/utils/s3service/s3.module';
import { SlackModule } from './apis/utils/slack/slack.module';
import { VectorDocumentModule } from './apis/vector-document/vector-document.module';
import { WordModule } from './apis/word';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    UserBlockModule,
    AdminBlockModule,
    AdminDashboardModule,
    AdBannerModule,
    PostsModule,
    CommentsModule,
    ReportModule,
    WordModule,
    FollowModule,
    PointsModule,
    LikesModule,
    EmailModule,
    WordModule,
    SearchModule,
    SlackModule, // Import the Slack module
    S3Module, // Import the S3 module
    LogsModule,
    CountryModule,
    SchoolModule,
    GamesModule,
    LevelThresholdModule,
    VectorDocumentModule,
    NotificationModule,
    AppVersionModule,
  ],
  providers: [SlackService],
})
export class V1Module {}
