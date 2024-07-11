import { Module } from '@nestjs/common';
import { MongoPrismaService } from '../../../../prisma';
import { EmailsModule } from '../email';
import { GeneralInquiryController } from './inquiry.controller';
import { GeneralInquiryService } from './inquiry.service';

@Module({
  imports: [EmailsModule],
  controllers: [GeneralInquiryController],
  providers: [GeneralInquiryService, MongoPrismaService],
})
export class GeneralInquiryModule {}
