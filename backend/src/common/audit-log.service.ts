import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogService {
    private readonly logger = new Logger(AuditLogService.name);

    constructor(
        @InjectRepository(AuditLog)
        private auditRepo: Repository<AuditLog>,
    ) { }

    async log(params: {
        tenantId: string;
        userId: string;
        action: string;
        entityType: string;
        entityId: string;
        oldValues?: any;
        newValues?: any;
        ipAddress?: string;
    }): Promise<void> {
        try {
            const entry = this.auditRepo.create(params);
            await this.auditRepo.save(entry);
            this.logger.debug(`[AUDIT] ${params.action} on ${params.entityType}:${params.entityId} by user ${params.userId}`);
        } catch (err: any) {
            this.logger.error(`Failed to write audit log: ${err.message}`);
        }
    }

    async findByEntity(tenantId: string, entityType: string, entityId: string): Promise<AuditLog[]> {
        return this.auditRepo.find({
            where: { tenantId, entityType, entityId },
            order: { createdAt: 'DESC' },
        });
    }

    async findByUser(tenantId: string, userId: string, limit = 50): Promise<AuditLog[]> {
        return this.auditRepo.find({
            where: { tenantId, userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }

    async findRecent(tenantId: string, limit = 100): Promise<AuditLog[]> {
        return this.auditRepo.find({
            where: { tenantId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
}
