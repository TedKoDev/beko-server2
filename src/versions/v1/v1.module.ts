import { Module } from '@nestjs/common';

import { AuthModule } from './apis/auth';
import { InquiryModule } from './apis/inquiry';
import { PostModule } from './apis/post';
import { UserModule } from './apis/user';

@Module({
  imports: [InquiryModule, AuthModule, UserModule, PostModule],
})
export class V1Module {}
