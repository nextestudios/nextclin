import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { Appointment } from '../appointments/entities/appointment.entity';
import { AccountReceivable } from '../financial/entities/account-receivable.entity';
import { AccountPayable } from '../financial/entities/account-payable.entity';
import { Batch } from '../vaccines/entities/batch.entity';
import { Application } from '../attendances/entities/application.entity';
import { AuditLog } from '../common/entities/audit-log.entity';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        TypeOrmModule.forFeature([Appointment, AccountReceivable, AccountPayable, Batch, Application, AuditLog]),
    ],
    providers: [NotificationsService],
    exports: [NotificationsService],
})
export class NotificationsModule { }
