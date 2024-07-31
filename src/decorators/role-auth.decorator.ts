import { JwtAuthGuard, RolesGuard } from '@/versions/v1/apis/auth';
import { applyDecorators, UseGuards } from '@nestjs/common';
import { AllowedRole, Roles } from './role.decorator';

export function Auth(roles: AllowedRole[]) {
  return applyDecorators(
    Roles(...roles),
    UseGuards(JwtAuthGuard),
    UseGuards(RolesGuard),
  );
}
