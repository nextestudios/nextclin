import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './entities/unit.entity';

@Injectable()
export class UnitsService {
    constructor(
        @InjectRepository(Unit)
        private unitsRepo: Repository<Unit>,
    ) { }

    async create(tenantId: string, dto: any): Promise<Unit> {
        const unit = this.unitsRepo.create({ ...dto, tenantId });
        const saved = await this.unitsRepo.save(unit);
        return Array.isArray(saved) ? saved[0] : saved;
    }

    async findAll(tenantId: string): Promise<Unit[]> {
        return this.unitsRepo.find({ where: { tenantId, active: true }, order: { name: 'ASC' } });
    }

    async findOne(tenantId: string, id: string): Promise<Unit | null> {
        return this.unitsRepo.findOne({ where: { id, tenantId } });
    }

    async update(tenantId: string, id: string, dto: any): Promise<Unit> {
        await this.unitsRepo.update({ id, tenantId }, dto);
        return this.findOne(tenantId, id) as Promise<Unit>;
    }

    async deactivate(tenantId: string, id: string): Promise<Unit> {
        return this.update(tenantId, id, { active: false });
    }
}
