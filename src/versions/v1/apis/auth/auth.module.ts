import { PrismaService } from '@/prisma';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { EmailModule } from '../email';
import { AuthController } from './auth.controller';
import { AuthProvider } from './auth.provider';
import { JwtStrategy } from './strategy';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), EmailModule],
  providers: [AuthProvider, JwtStrategy, PrismaService],
  controllers: [AuthController],
  exports: [AuthProvider],
})
export class AuthModule {}
