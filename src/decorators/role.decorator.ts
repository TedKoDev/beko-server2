import { ROLE } from '@/types/v1';
import { SetMetadata } from '@nestjs/common';

export type AllowedRole = keyof typeof ROLE | 'ANY';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: AllowedRole[]) => SetMetadata(ROLES_KEY, roles);
