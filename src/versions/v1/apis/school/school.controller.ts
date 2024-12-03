import { Auth } from '@/decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateSchoolDto } from './dto/create-school.dto';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { SchoolService } from './school.service';

@ApiTags('Korean Schools')
@Controller({
  path: 'schools',
  version: '1',
})
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Auth(['ADMIN'])
  @Post()
  @ApiOperation({ summary: 'Create a new school' })
  create(@Body() createSchoolDto: CreateSchoolDto) {
    return this.schoolService.create(createSchoolDto);
  }

  @Auth(['ANY'])
  @Get()
  @ApiOperation({ summary: 'Get all schools' })
  findAll(@Query() pagination: PaginationDto) {
    console.log('Request received for schools');
    console.log('Pagination:', pagination);
    console.log('Query params:', pagination.page, pagination.limit);
    return this.schoolService.findAll(pagination);
  }

  @Auth(['ANY'])
  @Get('region/:region')
  @ApiOperation({ summary: 'Get schools by region' })
  findByRegion(
    @Param('region') region: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.schoolService.findByRegion(region, pagination);
  }

  @Auth(['ANY'])
  @Get(':id')
  @ApiOperation({ summary: 'Get a school by id' })
  findOne(@Param('id') id: string) {
    return this.schoolService.findOne(+id);
  }

  @Auth(['ADMIN'])
  @Patch(':id')
  @ApiOperation({ summary: 'Update a school' })
  update(@Param('id') id: string, @Body() updateSchoolDto: UpdateSchoolDto) {
    return this.schoolService.update(+id, updateSchoolDto);
  }

  @Auth(['ADMIN'])
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a school' })
  remove(@Param('id') id: string) {
    return this.schoolService.remove(+id);
  }
}
