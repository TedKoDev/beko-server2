import { PrismaService } from '@/prisma/postsql-prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as config from 'config';
import OpenAI from 'openai';
import { CreateVectorDocumentDto } from './dto/create-vector-document.dto';
import { UpdateVectorDocumentDto } from './dto/update-vector-document.dto';

@Injectable()
export class VectorDocumentService {
  private readonly openai: OpenAI;

  constructor(private readonly prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: config.get<string>('openai.apiKey'),
    });
  }

  async create(createVectorDocumentDto: CreateVectorDocumentDto) {
    // OpenAI API를 사용하여 텍스트를 임베딩으로 변환
    const embeddingResponse = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: createVectorDocumentDto.content,
      encoding_format: 'float',
    });

    const embedding = embeddingResponse.data[0].embedding;
    const vectorString = `[${embedding.join(',')}]`;

    // 벡터 데이터 삽입을 위한 쿼리
    return this.prisma.$queryRaw`
      INSERT INTO "VectorDocument" (id, title, content, embedding, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        ${createVectorDocumentDto.title},
        ${createVectorDocumentDto.content},
        ${Prisma.raw(vectorString)}::vector,
        NOW(),
        NOW()
      )
      RETURNING *;
    `;
  }

  async findAll() {
    return this.prisma.vectorDocument.findMany({
      where: {
        deleted_at: null,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.vectorDocument.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateVectorDocumentDto: UpdateVectorDocumentDto) {
    return this.prisma.vectorDocument.update({
      where: { id },
      data: updateVectorDocumentDto,
    });
  }

  async remove(id: string) {
    return this.prisma.vectorDocument.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });
  }
}
