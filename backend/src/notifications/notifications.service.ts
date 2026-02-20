import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, In } from 'typeorm';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { AccountReceivable, PaymentStatus } from '../financial/entities/account-receivable.entity';
import { AccountPayable, PayableStatus } from '../financial/entities/account-payable.entity';
import { Batch } from '../vaccines/entities/batch.entity';
import { Vaccine } from '../vaccines/entities/vaccine.entity';
import { Application } from '../attendances/entities/application.entity';
import { AuditLog } from '../common/entities/audit-log.entity';
import { MessagingService } from './messaging.service';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        @InjectRepository(Appointment)
        private appointmentsRepo: Repository<Appointment>,
        @InjectRepository(AccountReceivable)
        private arRepo: Repository<AccountReceivable>,
        @InjectRepository(AccountPayable)
        private apRepo: Repository<AccountPayable>,
        @InjectRepository(Batch)
        private batchesRepo: Repository<Batch>,
        @InjectRepository(Application)
        private applicationsRepo: Repository<Application>,
        @InjectRepository(AuditLog)
        private auditRepo: Repository<AuditLog>,
        @InjectRepository(Vaccine)
        private vaccinesRepo: Repository<Vaccine>,
        private readonly messagingService: MessagingService,
    ) { }

    // Run every day at 8:00 AM — appointment reminders (24h before)
    @Cron(CronExpression.EVERY_DAY_AT_8AM)
    async sendAppointmentReminders() {
        this.logger.log('[JOB] Checking appointment reminders (24h)...');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStart = new Date(tomorrow.toISOString().split('T')[0]);
        const tomorrowEnd = new Date(tomorrowStart);
        tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

        const upcoming = await this.appointmentsRepo.find({
            where: {
                startTime: MoreThanOrEqual(tomorrowStart),
                status: In([AppointmentStatus.REQUESTED, AppointmentStatus.CONFIRMED]),
            },
            relations: ['patient'],
        });

        const filtered = upcoming.filter(a => new Date(a.startTime) < tomorrowEnd);

        for (const appt of filtered) {
            this.logger.log(`[REMINDER] Appointment ${appt.id} for patient ${appt.patient?.name || appt.patientId} at ${appt.startTime}`);
            // Send real WhatsApp notification
            if (appt.patient?.phone) {
                const dateStr = new Date(appt.startTime).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
                await this.messagingService.sendAppointmentReminder(
                    appt.patient.phone, appt.patient.name, dateStr, appt.tenantId, appt.id,
                );
            }
            await this.logNotification(appt.tenantId, 'APPOINTMENT_REMINDER_24H', 'appointment', appt.id);
        }
        this.logger.log(`[JOB] Sent ${filtered.length} appointment reminders.`);
    }

    // Run every day at 7:00 AM — overdue receivables alert
    @Cron(CronExpression.EVERY_DAY_AT_7AM)
    async checkOverdueReceivables() {
        this.logger.log('[JOB] Checking overdue receivables...');
        const today = new Date();

        const overdue = await this.arRepo.find({
            where: {
                status: PaymentStatus.OPEN,
                dueDate: LessThanOrEqual(today),
            },
        });

        for (const ar of overdue) {
            ar.status = PaymentStatus.OVERDUE;
            await this.arRepo.save(ar);
            this.logger.warn(`[OVERDUE] AccountReceivable ${ar.id} marked as OVERDUE (due: ${ar.dueDate})`);
        }
        this.logger.log(`[JOB] Marked ${overdue.length} receivables as overdue.`);
    }

    // Run every day at 7:30 AM — payable due date warning (5 days ahead)
    @Cron('0 30 7 * * *')
    async checkUpcomingPayables() {
        this.logger.log('[JOB] Checking upcoming payables (5 days)...');
        const fiveDaysLater = new Date();
        fiveDaysLater.setDate(fiveDaysLater.getDate() + 5);

        const upcoming = await this.apRepo.find({
            where: {
                status: PayableStatus.PENDING,
                dueDate: LessThanOrEqual(fiveDaysLater),
            },
        });

        for (const ap of upcoming) {
            this.logger.warn(`[PAYABLE WARNING] AccountPayable ${ap.id}: "${ap.description}" due on ${ap.dueDate}`);
        }
        this.logger.log(`[JOB] Found ${upcoming.length} payables due within 5 days.`);
    }

    // Run every Monday at 6:00 AM — expiring batches alert
    @Cron('0 0 6 * * 1')
    async checkExpiringBatches() {
        this.logger.log('[JOB] Checking expiring batches (60 days)...');
        const sixtyDaysLater = new Date();
        sixtyDaysLater.setDate(sixtyDaysLater.getDate() + 60);

        const expiring = await this.batchesRepo.createQueryBuilder('b')
            .where('b.expiry_date <= :date', { date: sixtyDaysLater.toISOString().split('T')[0] })
            .andWhere('b.quantity_available > 0')
            .leftJoinAndSelect('b.vaccine', 'v')
            .orderBy('b.expiry_date', 'ASC')
            .getMany();

        for (const batch of expiring) {
            const daysUntil = Math.ceil((new Date(batch.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const urgency = daysUntil <= 7 ? '🔴 URGENTE' : daysUntil <= 30 ? '🟡 ATENÇÃO' : '🟢 INFO';
            this.logger.warn(`[BATCH ${urgency}] ${batch.vaccine?.name || 'Vacina'} lote ${batch.lotNumber}: vence em ${daysUntil} dias (${batch.expiryDate}), qtd: ${batch.quantityAvailable}`);
        }
        this.logger.log(`[JOB] Found ${expiring.length} expiring batches.`);
    }

    // Run every day at 7:00 AM — low stock check
    @Cron('0 0 7 * * *')
    async checkLowStock() {
        this.logger.log('[JOB] Checking low stock vaccines...');
        const vaccines = await this.vaccinesRepo.find({
            where: { active: true },
            relations: ['batches'],
        });

        for (const vaccine of vaccines) {
            const totalAvailable = (vaccine.batches || []).reduce(
                (sum: number, b: any) => sum + (Number(b.quantityAvailable) || 0), 0
            );
            if (totalAvailable < vaccine.minimumStock) {
                this.logger.warn(`[⚠️ ESTOQUE BAIXO] ${vaccine.name}: ${totalAvailable} un. disponíveis (mínimo: ${vaccine.minimumStock})`);
            }
        }
    }

    // Run every day at 9:00 AM — next dose reminders (7 days before)
    @Cron(CronExpression.EVERY_DAY_AT_9AM)
    async sendNextDoseReminders() {
        this.logger.log('[JOB] Checking next dose reminders (7 days ahead)...');
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
        const sevenDaysStr = sevenDaysLater.toISOString().split('T')[0];
        const todayStr = new Date().toISOString().split('T')[0];

        const dueApplications = await this.applicationsRepo.createQueryBuilder('app')
            .where('app.next_dose_date IS NOT NULL')
            .andWhere('app.next_dose_date BETWEEN :today AND :sevenDays', { today: todayStr, sevenDays: sevenDaysStr })
            .getMany();

        for (const app of dueApplications) {
            this.logger.log(`[NEXT DOSE] Application ${app.id}: next dose on ${app.nextDoseDate} for patient attendance ${app.attendanceId}`);
            await this.logNotification(app.tenantId, 'NEXT_DOSE_REMINDER_7D', 'application', app.id);

            // Auto-create appointment suggestion if not already existing
            const existingAppt = await this.appointmentsRepo.findOne({
                where: {
                    tenantId: app.tenantId,
                    vaccineId: app.vaccineId,
                    status: In([AppointmentStatus.REQUESTED, AppointmentStatus.CONFIRMED]),
                },
            });

            if (!existingAppt) {
                const suggestedAppt = this.appointmentsRepo.create({
                    tenantId: app.tenantId,
                    patientId: (app as any).patientId || '',
                    professionalId: app.professionalId,
                    unitId: app.tenantId,
                    vaccineId: app.vaccineId,
                    startTime: new Date(app.nextDoseDate!),
                    endTime: new Date(new Date(app.nextDoseDate!).getTime() + 30 * 60 * 1000),
                    status: AppointmentStatus.REQUESTED,
                    notes: `Agendamento automático: próxima dose (aplicação ${app.id})`,
                });
                try {
                    await this.appointmentsRepo.save(suggestedAppt);
                    this.logger.log(`[AUTO-SCHEDULE] Created appointment for next dose of application ${app.id}`);
                } catch (err: any) {
                    this.logger.warn(`[AUTO-SCHEDULE] Could not create appointment: ${err.message}`);
                }
            }
        }
        this.logger.log(`[JOB] Processed ${dueApplications.length} next dose reminders.`);
    }

    private async logNotification(tenantId: string, action: string, entityType: string, entityId: string) {
        try {
            const entry = this.auditRepo.create({
                tenantId,
                userId: 'SYSTEM',
                action,
                entityType,
                entityId,
            });
            await this.auditRepo.save(entry);
        } catch { /* silent */ }
    }
}
