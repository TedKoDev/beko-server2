import { PrismaService } from '@/prisma';
import { Injectable } from '@nestjs/common';

export const POST_SERVICE_TOKEN = 'POST_SERVICE_TOKEN';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async create() {
    // this.prisma.post.create({
    //   data: {
    //     title: '안녕하세요',
    //     content: '내용입니다.',
    //     type: 'GENERAL',
    //     user_id: 1,
    //     category_id: 1,
    //   },
    // });
    return this.prisma.user.create({
      data: {
        email: 'yontp@',
        password_hash: '123123',
        username: '박윤찬',
        account_status: 'ACTIVE',
        role: 'ADMIN',
        sign_up_ip: '',
      },
    });
  }
}
