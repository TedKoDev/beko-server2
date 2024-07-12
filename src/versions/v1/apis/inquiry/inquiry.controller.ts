import { Body, Controller, Post } from '@nestjs/common';
import * as config from 'config';

import { CustomException } from '../../../../plugins';
import { ServiceName } from '../../../../types/v1';
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

      const serviceName =
        createGeneralInquiryDto.serviceType ===
        ServiceName.GENERAL_COFFEE_COORDINATOR
          ? '제너럴커피코디네이터'
          : createGeneralInquiryDto.serviceType === ServiceName.HONGI_GROUP
            ? '홍이그룹'
            : '커작어린이본부';

      await this.emailService.sendEmail({
        receiverEmail: config.get('email.receiverEmail'),
        subject: `${serviceName} - ${createGeneralInquiryDto.inquiryType} 문의`,
        content: `
          이메일: ${createGeneralInquiryDto.email}\n
          내용:${createGeneralInquiryDto.message}\n
        `,
      });
      return response;
    } catch (error) {
      throw new CustomException({});
    }
  }
}
