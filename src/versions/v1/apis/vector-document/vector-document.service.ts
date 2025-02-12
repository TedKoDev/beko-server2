import { PrismaService } from '@/prisma/postsql-prisma.service';
import { Injectable } from '@nestjs/common';
import * as config from 'config';
import OpenAI from 'openai';
import { CreateVectorDocumentDto } from './dto/create-vector-document.dto';
import { UpdateVectorDocumentDto } from './dto/update-vector-document.dto';

interface VectorDocumentWithSimilarity {
  id: string;
  title: string;
  content: string;
  similarity: number;
}

@Injectable()
export class VectorDocumentService {
  private readonly openai: OpenAI;

  constructor(private readonly prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: config.get<string>('openai.apiKey'),
    });
  }

  private preprocessText(text: string): string {
    // 1. 불필요한 공백 제거
    text = text.replace(/\s+/g, ' ').trim();

    // 2. JSON 데이터 처리
    try {
      const jsonData = JSON.parse(text);
      return this.flattenJson(jsonData);
    } catch (e) {
      // JSON이 아닌 경우 원본 텍스트 반환
      return text;
    }
  }

  private flattenJson(obj: any, prefix = ''): string {
    const result: string[] = [];

    for (const key of Object.keys(obj)) {
      const value = obj[key];
      const newPrefix = prefix ? `${prefix} ${key}` : key;

      if (value === null) continue;

      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          // 배열인 경우
          result.push(`${newPrefix}: ${value.join(', ')}`);
        } else {
          // 객체인 경우 재귀적으로 처리
          result.push(this.flattenJson(value, newPrefix));
        }
      } else {
        // 기본 타입인 경우
        result.push(`${newPrefix}: ${value}`);
      }
    }

    return result.join('\n');
  }

  private async createEmbedding(text: string) {
    const processedText = this.preprocessText(text);
    console.log(
      'Creating embedding for processed text:',
      processedText.substring(0, 200) + '...',
    );

    const embeddingResponse = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: processedText,
      encoding_format: 'float',
    });
    return embeddingResponse.data[0].embedding;
  }

  async create(createVectorDocumentDto: CreateVectorDocumentDto) {
    const embedding = await this.createEmbedding(
      createVectorDocumentDto.content,
    );

    // PostgreSQL vector 타입을 위한 문자열 형식으로 변환
    return this.prisma.$executeRaw`
      INSERT INTO "VectorDocument" (id, title, content, embedding, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        ${createVectorDocumentDto.title},
        ${createVectorDocumentDto.content},
        ${`[${embedding.join(',')}]`}::vector,
        NOW(),
        NOW()
      );
    `;
  }

  async findSimilarDocuments(
    query: string,
    limit: number = 5,
  ): Promise<VectorDocumentWithSimilarity[]> {
    const processedQuery = this.preprocessText(query);
    console.log('Processed query:', processedQuery);

    const queryEmbedding = await this.createEmbedding(processedQuery);

    const results = await this.prisma.$queryRaw<VectorDocumentWithSimilarity[]>`
      WITH ranked_docs AS (
        SELECT 
          id,
          title,
          content,
          1 - (embedding <=> ${`[${queryEmbedding.join(',')}]`}::vector) as similarity
        FROM "VectorDocument"
        WHERE deleted_at IS NULL
      )
      SELECT * FROM ranked_docs
      WHERE similarity > 0.1
      ORDER BY similarity DESC
      LIMIT ${limit};
    `;

    console.log(
      'Vector search results:',
      results.map((r) => ({
        title: r.title,
        similarity: r.similarity,
        preview: this.preprocessText(r.content).substring(0, 100) + '...',
      })),
    );

    return results;
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
