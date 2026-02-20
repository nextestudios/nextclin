import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { MessagingService } from './messaging.service';
import { NotificationQueue } from './notification-queue.service';
import { MessageLogsController } from './message-logs.controller';
import { Appointment } from '../appointments/entities/appointment.entity';
import { AccountReceivable } from '../financial/entities/account-receivable.entity';
import { AccountPayable } from '../financial/entities/account-payable.entity';
import { Batch } from '../vaccines/entities/batch.entity';
import { Vaccine } from '../vaccines/entities/vaccine.entity';
import { Application } from '../attendances/entities/application.entity';
import { AuditLog } from '../common/entities/audit-log.entity';
import { MessageLog } from './entities/message-log.entity';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        TypeOrmModule.forFeature([
            Appointment, AccountReceivable, AccountPayable,
            Batch, Vaccine, Application, AuditLog, MessageLog,
        ]),
    ],
    controllers: [MessageLogsController],
    providers: [NotificationsService, MessagingService, NotificationQueue],
    exports: [NotificationsService, MessagingService, NotificationQueue],
})
export class NotificationsModule { }
