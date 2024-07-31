import { ROLES_KEY } from '@/decorators';
import { MongoPrismaService } from '@/prisma';
import { ROLE } from '@/types/v1';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly prisma: MongoPrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<ROLE[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const userId = user.id;
    if (!userId) {
      return false;
    }
    const { role } = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    return requiredRoles.some((requireRole) => role.includes(requireRole));
  }
}
