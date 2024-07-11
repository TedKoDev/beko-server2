import { Injectable } from '@nestjs/common';
import { CustomException } from '../../../../plugins';
import { MongoPrismaService } from '../../../../prisma';
import { ServiceName } from '../../../../types/v1';
import { CreateInquiryDto } from './dto';

@Injectable()
export class GeneralInquiryService {
  constructor(private readonly prisma: MongoPrismaService) {}

  async create(createGeneralInquiryDto: CreateInquiryDto) {
    if (
      createGeneralInquiryDto.serviceType ===
      ServiceName.GENERAL_COFFEE_COORDINATOR
    ) {
      return this.prisma.inquiry.create({
        data: createGeneralInquiryDto,
      });
    }

    if (createGeneralInquiryDto.serviceType === ServiceName.HONGI_GROUP) {
      return this.prisma.inquiry.create({
        data: createGeneralInquiryDto,
      });
    }

    if (
      createGeneralInquiryDto.serviceType === ServiceName.KID_FOUNDATION &&
      createGeneralInquiryDto.additionalConsent !== undefined &&
      createGeneralInquiryDto.phone !== undefined
    ) {
      console.log(typeof createGeneralInquiryDto.additionalConsent);
      return this.prisma.inquiry.create({
        data: createGeneralInquiryDto,
      });
    }

    throw new CustomException({
      statusCode: 400,
      messageParams: {
        serviceType: createGeneralInquiryDto.serviceType,
      },
    });
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const totalCount = await this.prisma.inquiry.count();
    const inquiries = await this.prisma.inquiry.findMany({
      skip,
      take: limit,
    });

    return {
      totalCount,
      page,
      limit,
      inquiries,
    };
  }

  async delete(id: string) {
    return this.prisma.inquiry.delete({
      where: { id },
    });
  }
}
