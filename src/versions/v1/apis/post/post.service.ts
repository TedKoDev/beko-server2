import { PrismaService } from '@/prisma';
import { Injectable } from '@nestjs/common';

export const POST_SERVICE_TOKEN = 'POST_SERVICE_TOKEN';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async create() {}
}
