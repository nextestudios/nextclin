import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Insurance } from './entities/insurance.entity';

@Injectable()
export class InsurancesService {
    constructor(
        @InjectRepository(Insurance)
        private insurancesRepo: Repository<Insurance>,
    ) { }

    async create(tenantId: string, dto: any): Promise<Insurance> {
        const insurance = this.insurancesRepo.create({ ...dto, tenantId });
        const saved = await this.insurancesRepo.save(insurance);
        return Array.isArray(saved) ? saved[0] : saved;
    }

    async findAll(tenantId: string): Promise<Insurance[]> {
        return this.insurancesRepo.find({
            where: { tenantId, active: true },
            order: { name: 'ASC' },
        });
    }

    async findOne(tenantId: string, id: string): Promise<Insurance | null> {
        return this.insurancesRepo.findOne({ where: { id, tenantId } });
    }

    async update(tenantId: string, id: string, dto: any): Promise<Insurance> {
        await this.insurancesRepo.update({ id, tenantId }, dto);
        return this.findOne(tenantId, id) as Promise<Insurance>;
    }

    async deactivate(tenantId: string, id: string): Promise<Insurance> {
        return this.update(tenantId, id, { active: false });
    }
}
