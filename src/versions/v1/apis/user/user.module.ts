import { PrismaService } from '@/prisma';
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth';
import { UserController } from './user.controller';
import { UserProvider } from './user.provider';

@Module({
  imports: [AuthModule],
  providers: [PrismaService, UserProvider],
  controllers: [UserController],
  exports: [UserProvider],
})
export class UserModule {}
