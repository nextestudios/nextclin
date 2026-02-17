import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance, AttendanceStatus, AttendancePriority } from './entities/attendance.entity';
import { Application } from './entities/application.entity';
import { StockService } from '../stock/stock.service';
import { MovementReason } from '../stock/entities/stock-movement.entity';
import { Vaccine } from '../vaccines/entities/vaccine.entity';

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

        // High priority first, then by creation time
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
        // Validate batch not expired (handled in stock service)
        // Decrement stock
        await this.stockService.addExit(
            tenantId, dto.batchId, 1, MovementReason.APPLICATION, userId,
            `Aplicação no atendimento ${attendanceId}`,
        );

        // Calculate next dose date
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
        return this.attendancesRepo.findOne({ where: { id, tenantId } }) as Promise<Attendance>;
    }

    async findOne(tenantId: string, id: string): Promise<Attendance | null> {
        return this.attendancesRepo.findOne({
            where: { id, tenantId },
            relations: ['patient', 'applications', 'applications.batch'],
        });
    }
}
