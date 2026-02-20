import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AdminRole } from './entities/admin-user.entity';

/**
 * SuperAdminGuard — validates tokens issued specifically for the admin panel.
 * Uses a SEPARATE JWT secret (ADMIN_JWT_SECRET) and validates the issuer claim.
 * Tenant JWTs are REJECTED here, even if valid.
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Token de admin não informado.');
        }

        const token = authHeader.split(' ')[1];

        try {
            const secret = this.configService.get<string>('ADMIN_JWT_SECRET') || 'admin-secret-change-in-prod';
            const payload = this.jwtService.verify(token, { secret });

            // Enforce admin issuer
            if (payload.iss !== 'nextclin-admin') {
                throw new ForbiddenException('Token não autorizado para painel admin.');
            }

            if (![AdminRole.SUPER_ADMIN, AdminRole.ADMIN].includes(payload.role)) {
                throw new ForbiddenException('Permissão insuficiente.');
            }

            request.adminUser = payload;
            return true;
        } catch (err) {
            if (err instanceof ForbiddenException) throw err;
            throw new UnauthorizedException('Token de admin inválido ou expirado.');
        }
    }
}
