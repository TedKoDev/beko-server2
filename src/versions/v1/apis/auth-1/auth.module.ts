import { Module } from '@nestjs/common';
import { MongoPrismaService } from '../../../../prisma';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, MongoPrismaService],
})
export class AuthModule1 {}
