import { MongoPrismaService } from '@/prisma/prisma.service';
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth';
import { UserController } from './user.controller';
import { UserProvider } from './user.provider';

@Module({
  imports: [AuthModule],
  providers: [MongoPrismaService, UserProvider],
  controllers: [UserController],
})
export class UserModule {}
