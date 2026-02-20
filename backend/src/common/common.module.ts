import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';
import { HealthController } from './health.controller';

@Module({
    imports: [TypeOrmModule.forFeature([AuditLog])],
    controllers: [AuditLogController, HealthController],
    providers: [AuditLogService],
    exports: [AuditLogService],
})
export class CommonModule { }
