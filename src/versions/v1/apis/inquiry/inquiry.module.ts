import { MongoPrismaService } from '@/prisma';
import { Module } from '@nestjs/common';

import { EmailModule } from '../email';
import { EmailProvider } from '../email/email.provider';
import { InquiryController } from './inquiry.controller';
import { InquiryProvider } from './inquiry.provider';

@Module({
  imports: [EmailModule],
  controllers: [InquiryController],
  providers: [MongoPrismaService, InquiryProvider, EmailProvider],
  exports: [InquiryProvider],
})
export class InquiryModule {}
