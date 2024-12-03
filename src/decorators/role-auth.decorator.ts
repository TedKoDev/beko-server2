import { JwtAuthGuard } from '@/versions/v1/apis/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/versions/v1/apis/auth/guards/roles.guard';
import { UseGuards, applyDecorators } from '@nestjs/common';
import { AllowedRole, Roles } from './role.decorator';

export const Auth = (roles: AllowedRole[] = []) =>
  applyDecorators(Roles(...roles), UseGuards(JwtAuthGuard, RolesGuard));
