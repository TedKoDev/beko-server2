import { Injectable } from '@nestjs/common';
import { MongoPrismaService } from '../../../../prisma';
import { CreateGeneralInquiryDto } from './dto';

@Injectable()
export class GeneralInquiryService {
  constructor(private readonly prisma: MongoPrismaService) {}

  async create(createGeneralInquiryDto: CreateGeneralInquiryDto) {
    return this.prisma.generalInquiry.create({
      data: createGeneralInquiryDto,
    });
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const totalCount = await this.prisma.generalInquiry.count();
    const inquiries = await this.prisma.generalInquiry.findMany({
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
    return this.prisma.generalInquiry.delete({
      where: { id },
    });
  }
}
