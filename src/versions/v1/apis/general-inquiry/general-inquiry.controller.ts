import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from '../../../../decorators/roles.decorator';
import { Role } from '../../../../types/v1';
import { CreateGeneralInquiryDto } from './dto';
import { GeneralInquiryService } from './general-inquiry.service';

@Controller({
  path: 'general-inquiry',
  version: '1',
})
export class GeneralInquiryController {
  constructor(private readonly generalInquiryService: GeneralInquiryService) {}

  @Post()
  async create(@Body() createGeneralInquiryDto: CreateGeneralInquiryDto) {
    return this.generalInquiryService.create(createGeneralInquiryDto);
  }

  @Roles(Role.SUPER_ADMIN, Role.MANAGER)
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.generalInquiryService.findAll(Number(page), Number(limit));
  }

  @Roles(Role.SUPER_ADMIN, Role.MANAGER)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.generalInquiryService.delete(id);
  }
}
