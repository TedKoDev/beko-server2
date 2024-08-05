import { PrismaService } from '@/prisma';
import { Injectable } from '@nestjs/common';

export const USER_SERVIE_TOKEN = 'USER_SERVIE_TOKEN';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async profile(userId: number) {
    return this.prisma.users.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        email: true,
        username: true,
      },
    });
  }
}
