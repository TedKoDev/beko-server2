import { Module } from '@nestjs/common';
import { AuthModule } from './apis/auth';
import { InquiryModule } from './apis/inquiry';
import { UserModule } from './apis/user';

@Module({
  imports: [InquiryModule, AuthModule, UserModule],
})
export class V1Module {}
