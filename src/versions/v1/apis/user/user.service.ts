import { MongoPrismaService } from '@/prisma';
import { Injectable } from '@nestjs/common';

export const USER_SERVIE_TOKEN = 'USER_SERVIE_TOKEN';

@Injectable()
export class UserService {
  constructor(private readonly prisma: MongoPrismaService) {}

  async profile(userId: string) {
    return this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
  }
}
