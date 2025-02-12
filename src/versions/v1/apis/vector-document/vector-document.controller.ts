import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CreateVectorDocumentDto } from './dto/create-vector-document.dto';
import { UpdateVectorDocumentDto } from './dto/update-vector-document.dto';
import { VectorDocumentService } from './vector-document.service';

@Controller({
  path: 'vector-document',
  version: '1',
})
export class VectorDocumentController {
  constructor(private readonly vectorDocumentService: VectorDocumentService) {}

  @Post()
  @ApiOperation({ summary: '벡터 문서 생성' })
  create(@Body() createVectorDocumentDto: CreateVectorDocumentDto) {
    return this.vectorDocumentService.create(createVectorDocumentDto);
  }

  @Get()
  @ApiOperation({ summary: '모든 벡터 문서 조회' })
  findAll() {
    return this.vectorDocumentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 벡터 문서 조회' })
  findOne(@Param('id') id: string) {
    return this.vectorDocumentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '벡터 문서 수정' })
  update(
    @Param('id') id: string,
    @Body() updateVectorDocumentDto: UpdateVectorDocumentDto,
  ) {
    return this.vectorDocumentService.update(id, updateVectorDocumentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '벡터 문서 삭제' })
  remove(@Param('id') id: string) {
    return this.vectorDocumentService.remove(id);
  }
}
