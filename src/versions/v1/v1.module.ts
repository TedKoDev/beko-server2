import { Module } from '@nestjs/common';
import { AuthModule } from './apis/auth';
import { GeneralInquiryModule } from './apis/inquiry';

@Module({
  imports: [GeneralInquiryModule, AuthModule],
})
export class V1Module {}
