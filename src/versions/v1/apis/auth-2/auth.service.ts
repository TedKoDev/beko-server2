import { Injectable } from '@nestjs/common';
import { MongoPrismaService } from '../../../../prisma';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: MongoPrismaService) {}
}
