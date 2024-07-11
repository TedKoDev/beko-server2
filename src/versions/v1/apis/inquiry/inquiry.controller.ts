import { Body, Controller, Post } from '@nestjs/common';
import { CustomException } from '../../../../plugins';
import { EmailsService } from '../email';
import { CreateInquiryDto } from './dto';
import { GeneralInquiryService } from './inquiry.service';

@Controller({
  path: 'general-inquiry',
  version: '1',
})
export class GeneralInquiryController {
  constructor(
    private readonly generalInquiryService: GeneralInquiryService,
    private readonly emailService: EmailsService,
  ) {}

  @Post()
  async create(@Body() createGeneralInquiryDto: CreateInquiryDto) {
    try {
      const response = await this.generalInquiryService.create(
        createGeneralInquiryDto,
      );

      this.emailService.sendEmail({
        receiverEmail: 'HongLee 문의 봇',
        subject: 'General Inquiry',
        content: createGeneralInquiryDto.message,
      });
      return response;
    } catch (error) {
      throw new CustomException({});
    }
  }
}
