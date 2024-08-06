// src/auth/auth.module.ts
import { PrismaService } from '@/prisma';
import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { EmailModule } from '../email';

import { PointsModule } from '../point';
import { AuthController } from './auth.controller';
import { AuthProvider } from './auth.provider';
import { JwtStrategy } from './strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    EmailModule,
    forwardRef(() => PointsModule),
  ],
  providers: [AuthProvider, JwtStrategy, PrismaService],
  controllers: [AuthController],
  exports: [AuthProvider],
})
export class AuthModule {}
