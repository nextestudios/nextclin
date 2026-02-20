import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuditLogService } from './audit-log.service';

@Controller('audit-logs')
@UseGuards(AuthGuard('jwt'))
export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService) { }

    @Get()
    findRecent(@Request() req: any) {
        const tenantId = req.user.tenantIds?.[0];
        return this.auditLogService.findRecent(tenantId, 200);
    }
}
