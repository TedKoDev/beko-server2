import { Module } from '@nestjs/common';
import { GeneralInquiryModule } from './apis/general-inquiry';

@Module({
  imports: [GeneralInquiryModule],
})
export class V1Module {}
