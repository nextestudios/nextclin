import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles || requiredRoles.length === 0) {
            return true; // No roles required, allow access
        }

        const { user } = context.switchToHttp().getRequest();
        if (!user || !user.role) {
            throw new ForbiddenException('Acesso negado: sem perfil de usuário.');
        }

        const hasRole = requiredRoles.includes(user.role);
        if (!hasRole) {
            throw new ForbiddenException(`Acesso negado: requer perfil ${requiredRoles.join(' ou ')}.`);
        }
        return true;
    }
}
