import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that extracts tenantId from the authenticated JWT user
 * and attaches it to the request object for easy access in controllers/services.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const user = (req as any).user;
        if (user && user.tenantIds && user.tenantIds.length > 0) {
            // Use the first tenantId by default (multi-tenant selection can be added later)
            (req as any).tenantId = user.tenantIds[0];
        }
        next();
    }
}
