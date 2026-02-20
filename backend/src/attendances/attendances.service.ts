import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance, AttendanceStatus, AttendancePriority } from './entities/attendance.entity';
import { Application } from './entities/application.entity';
import { StockService } from '../stock/stock.service';
import { MovementReason } from '../stock/entities/stock-movement.entity';
import { Vaccine } from '../vaccines/entities/vaccine.entity';
import { FinancialService } from '../financial/financial.service';

@Injectable()
export class AttendancesService {
    constructor(
        @InjectRepository(Attendance)
        private attendancesRepo: Repository<Attendance>,
        @InjectRepository(Application)
        private applicationsRepo: Repository<Application>,
        @InjectRepository(Vaccine)
        private vaccinesRepo: Repository<Vaccine>,
        private stockService: StockService,
        private financialService: FinancialService,
    ) { }

    async create(tenantId: string, dto: any): Promise<Attendance> {
        const code = `ATD-${Date.now().toString(36).toUpperCase()}`;
        const attendance = this.attendancesRepo.create({ ...dto, tenantId, code });
        const saved = await this.attendancesRepo.save(attendance);
        return Array.isArray(saved) ? saved[0] : saved;
    }

    async findQueue(tenantId: string, unitId?: string): Promise<Attendance[]> {
        const qb = this.attendancesRepo.createQueryBuilder('a')
            .leftJoinAndSelect('a.patient', 'patient')
            .where('a.tenant_id = :tenantId', { tenantId })
            .andWhere('a.status IN (:...statuses)', { statuses: [AttendanceStatus.WAITING, AttendanceStatus.IN_PROGRESS] });

        if (unitId) {
            qb.andWhere('a.unit_id = :unitId', { unitId });
        }

        qb.orderBy(`CASE a.priority 
      WHEN 'HIGH' THEN 1 
      WHEN 'MEDIUM' THEN 2 
      WHEN 'LOW' THEN 3 
      WHEN 'ELECTIVE' THEN 4 
      ELSE 5 END`, 'ASC')
            .addOrderBy('a.created_at', 'ASC');

        return qb.getMany();
    }

    async applyVaccine(tenantId: string, attendanceId: string, dto: any, userId: string): Promise<Application> {
        await this.stockService.addExit(
            tenantId, dto.batchId, 1, MovementReason.APPLICATION, userId,
            `Aplicação no atendimento ${attendanceId}`,
        );

        let nextDoseDate: Date | null = null;
        const vaccine = await this.vaccinesRepo.findOne({ where: { id: dto.vaccineId } });
        if (vaccine && vaccine.doseIntervalDays > 0 && dto.doseNumber < vaccine.totalDoses) {
            nextDoseDate = new Date();
            nextDoseDate.setDate(nextDoseDate.getDate() + vaccine.doseIntervalDays);
        }

        const application = this.applicationsRepo.create({
            ...dto,
            tenantId,
            attendanceId,
            professionalId: dto.professionalId || userId,
            appliedAt: new Date(),
            nextDoseDate,
        });
        const saved = await this.applicationsRepo.save(application);
        return Array.isArray(saved) ? saved[0] : saved;
    }

    async updateStatus(tenantId: string, id: string, status: AttendanceStatus): Promise<Attendance> {
        await this.attendancesRepo.update({ id, tenantId }, { status });

        // Auto-generate revenue when attendance is completed
        if (status === AttendanceStatus.COMPLETED) {
            await this.generateRevenue(tenantId, id);
        }

        return this.attendancesRepo.findOne({ where: { id, tenantId } }) as Promise<Attendance>;
    }

    /**
     * Generates an AccountReceivable automatically when an attendance is completed.
     * Sums up the sale prices of all vaccines applied during this attendance.
     */
    private async generateRevenue(tenantId: string, attendanceId: string): Promise<void> {
        const attendance = await this.attendancesRepo.findOne({
            where: { id: attendanceId, tenantId },
            relations: ['applications'],
        });

        if (!attendance || !attendance.applications || attendance.applications.length === 0) {
            return; // No vaccines applied, no revenue to generate
        }

        let totalAmount = 0;
        for (const app of attendance.applications) {
            const vaccine = await this.vaccinesRepo.findOne({ where: { id: app.vaccineId } });
            if (vaccine && vaccine.salePrice) {
                totalAmount += Number(vaccine.salePrice);
            }
        }

        if (totalAmount > 0) {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30); // 30 days to pay

            await this.financialService.createReceivable(tenantId, {
                attendanceId,
                patientId: attendance.patientId,
                amount: totalAmount,
                dueDate: dueDate.toISOString().split('T')[0],
                notes: `Gerado automaticamente - Atendimento ${attendance.code}`,
            });
        }
    }

    async findOne(tenantId: string, id: string): Promise<Attendance | null> {
        return this.attendancesRepo.findOne({
            where: { id, tenantId },
            relations: ['patient', 'applications', 'applications.batch'],
        });
    }

    async getTodayStats(tenantId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const totalToday = await this.attendancesRepo.createQueryBuilder('a')
            .where('a.tenant_id = :tenantId', { tenantId })
            .andWhere('a.created_at >= :today AND a.created_at < :tomorrow', {
                today: today.toISOString(),
                tomorrow: tomorrow.toISOString(),
            })
            .getCount();

        const completedToday = await this.attendancesRepo.createQueryBuilder('a')
            .where('a.tenant_id = :tenantId', { tenantId })
            .andWhere('a.status = :status', { status: AttendanceStatus.COMPLETED })
            .andWhere('a.created_at >= :today AND a.created_at < :tomorrow', {
                today: today.toISOString(),
                tomorrow: tomorrow.toISOString(),
            })
            .getCount();

        const applicationsToday = await this.applicationsRepo.createQueryBuilder('ap')
            .where('ap.tenant_id = :tenantId', { tenantId })
            .andWhere('ap.applied_at >= :today AND ap.applied_at < :tomorrow', {
                today: today.toISOString(),
                tomorrow: tomorrow.toISOString(),
            })
            .getCount();

        const waitingCount = await this.attendancesRepo.createQueryBuilder('a')
            .where('a.tenant_id = :tenantId', { tenantId })
            .andWhere('a.status IN (:...statuses)', { statuses: [AttendanceStatus.WAITING, AttendanceStatus.IN_PROGRESS] })
            .getCount();

        return {
            totalToday,
            completedToday,
            applicationsToday,
            waitingCount,
        };
    }
}
