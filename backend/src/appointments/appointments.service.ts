import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, Not, And } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';

@Injectable()
export class AppointmentsService {
    constructor(
        @InjectRepository(Appointment)
        private appointmentsRepo: Repository<Appointment>,
    ) { }

    async create(tenantId: string, dto: any): Promise<Appointment> {
        // Check for scheduling conflicts
        const conflict = await this.appointmentsRepo.findOne({
            where: {
                tenantId,
                professionalId: dto.professionalId,
                startTime: LessThanOrEqual(new Date(dto.endTime)),
                endTime: MoreThanOrEqual(new Date(dto.startTime)),
                status: Not(AppointmentStatus.CANCELLED),
            },
        });

        if (conflict) {
            throw new BadRequestException('Conflito de horário: o profissional já possui agendamento neste período.');
        }

        const appointment = this.appointmentsRepo.create({ ...dto, tenantId });
        const saved = await this.appointmentsRepo.save(appointment);
        return Array.isArray(saved) ? saved[0] : saved;
    }

    async findAll(tenantId: string, filters?: any): Promise<Appointment[]> {
        const qb = this.appointmentsRepo.createQueryBuilder('a')
            .leftJoinAndSelect('a.patient', 'patient')
            .where('a.tenant_id = :tenantId', { tenantId });

        if (filters?.date) {
            qb.andWhere('DATE(a.start_time) = :date', { date: filters.date });
        }
        if (filters?.dateFrom && filters?.dateTo) {
            qb.andWhere('DATE(a.start_time) BETWEEN :dateFrom AND :dateTo', {
                dateFrom: filters.dateFrom,
                dateTo: filters.dateTo,
            });
        }
        if (filters?.professionalId) {
            qb.andWhere('a.professional_id = :professionalId', { professionalId: filters.professionalId });
        }
        if (filters?.status) {
            qb.andWhere('a.status = :status', { status: filters.status });
        }
        return qb.orderBy('a.start_time', 'ASC').getMany();
    }

    async findOne(tenantId: string, id: string): Promise<Appointment | null> {
        return this.appointmentsRepo.findOne({
            where: { id, tenantId },
            relations: ['patient'],
        });
    }

    async updateStatus(tenantId: string, id: string, status: AppointmentStatus): Promise<Appointment> {
        await this.appointmentsRepo.update({ id, tenantId }, { status });
        return this.findOne(tenantId, id) as Promise<Appointment>;
    }

    async cancel(tenantId: string, id: string): Promise<Appointment> {
        return this.updateStatus(tenantId, id, AppointmentStatus.CANCELLED);
    }
}
