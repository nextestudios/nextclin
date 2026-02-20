import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';

@Injectable()
export class PatientsService {
    constructor(
        @InjectRepository(Patient)
        private patientsRepo: Repository<Patient>,
    ) { }

    async create(tenantId: string, dto: CreatePatientDto): Promise<Patient> {
        if (dto.cpf) {
            const existing = await this.patientsRepo.findOne({
                where: { tenantId, cpf: dto.cpf },
            });
            if (existing) {
                throw new ConflictException('CPF já cadastrado nesta clínica.');
            }
        }

        const prontuario = `PRON-${Date.now().toString(36).toUpperCase()}`;

        const patient = this.patientsRepo.create({
            ...dto,
            tenantId,
            prontuario,
        });
        return this.patientsRepo.save(patient);
    }

    async findAll(tenantId: string, search?: string): Promise<Patient[]> {
        const qb = this.patientsRepo.createQueryBuilder('p')
            .where('p.tenant_id = :tenantId', { tenantId });

        if (search) {
            qb.andWhere('(p.name LIKE :search OR p.cpf LIKE :search OR p.prontuario LIKE :search)', {
                search: `%${search}%`,
            });
        }
        return qb.orderBy('p.name', 'ASC').getMany();
    }

    async findOne(tenantId: string, id: string): Promise<Patient | null> {
        return this.patientsRepo.findOne({
            where: { id, tenantId },
            relations: [
                'attendances',
                'attendances.applications',
                'attendances.applications.batch',
                'appointments',
            ],
        });
    }

    async update(tenantId: string, id: string, dto: Partial<CreatePatientDto>): Promise<Patient> {
        await this.patientsRepo.update({ id, tenantId }, dto);
        return this.findOne(tenantId, id) as Promise<Patient>;
    }

    async remove(tenantId: string, id: string): Promise<void> {
        await this.patientsRepo.softDelete({ id, tenantId });
    }
}
