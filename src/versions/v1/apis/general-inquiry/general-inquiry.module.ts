import { Module } from '@nestjs/common';
import { MongoPrismaService } from '../../../../prisma';
import { GeneralInquiryController } from './general-inquiry.controller';
import { GeneralInquiryService } from './general-inquiry.service';

@Module({
  controllers: [GeneralInquiryController],
  providers: [GeneralInquiryService, MongoPrismaService],
})
export class GeneralInquiryModule {}
