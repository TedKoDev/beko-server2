import { Module } from '@nestjs/common';

import { AuthModule } from './apis/auth';
import { InquiryModule } from './apis/inquiry';
import { PostsModule } from './apis/posts';
import { UserModule } from './apis/user';

@Module({
  imports: [InquiryModule, AuthModule, UserModule, PostsModule],
})
export class V1Module {}
