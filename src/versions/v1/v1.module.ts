import { Module } from '@nestjs/common';
import { AuthModule1 } from './apis/auth-1';
import { AuthModule2 } from './apis/auth-2';
import { GeneralInquiryModule } from './apis/inquiry';

@Module({
  imports: [GeneralInquiryModule, AuthModule1, AuthModule2],
})
export class V1Module {}
