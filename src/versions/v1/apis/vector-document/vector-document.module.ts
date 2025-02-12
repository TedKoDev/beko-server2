import { PrismaService } from '@/prisma/postsql-prisma.service';
import { Module } from '@nestjs/common';
import { VectorDocumentController } from './vector-document.controller';
import { VectorDocumentService } from './vector-document.service';

@Module({
  controllers: [VectorDocumentController],
  providers: [VectorDocumentService, PrismaService],
  exports: [VectorDocumentService, PrismaService],
})
export class VectorDocumentModule {}
