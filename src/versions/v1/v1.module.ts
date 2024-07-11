import { Module } from '@nestjs/common';
import { GeneralInquiryModule } from './apis/inquiry';

@Module({
  imports: [GeneralInquiryModule],
})
export class V1Module {}
