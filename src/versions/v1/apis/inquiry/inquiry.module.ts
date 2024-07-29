import { Module } from '@nestjs/common';
import { MongoPrismaService } from '../../../../prisma';
import { EmailModule } from '../email';
import { GeneralInquiryController } from './inquiry.controller';
import { GeneralInquiryService } from './inquiry.service';

@Module({
  imports: [EmailModule],
  controllers: [GeneralInquiryController],
  providers: [GeneralInquiryService, MongoPrismaService],
})
export class GeneralInquiryModule {}
