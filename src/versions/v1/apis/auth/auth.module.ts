import { MongoPrismaService } from '@/prisma/prisma.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as config from 'config';

import { EmailModule } from '../email';
import { AuthController } from './auth.controller';
import { AuthProvider } from './auth.provider';
import { JwtStrategy } from './strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({ secret: config.get('jwt.secret') }),
    EmailModule,
  ],
  providers: [AuthProvider, JwtStrategy, MongoPrismaService],
  controllers: [AuthController],
  exports: [AuthProvider],
})
export class AuthModule {}
