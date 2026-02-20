import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Professional } from './entities/professional.entity';

@Injectable()
export class ProfessionalsService {
    constructor(
        @InjectRepository(Professional)
        private professionalsRepo: Repository<Professional>,
    ) { }

    async create(tenantId: string, dto: any): Promise<Professional> {
        const professional = this.professionalsRepo.create({ ...dto, tenantId });
        const saved = await this.professionalsRepo.save(professional);
        return Array.isArray(saved) ? saved[0] : saved;
    }

    async findAll(tenantId: string): Promise<Professional[]> {
        return this.professionalsRepo.find({
            where: { tenantId, active: true },
            order: { name: 'ASC' },
        });
    }

    async findOne(tenantId: string, id: string): Promise<Professional | null> {
        return this.professionalsRepo.findOne({ where: { id, tenantId } });
    }

    async update(tenantId: string, id: string, dto: any): Promise<Professional> {
        await this.professionalsRepo.update({ id, tenantId }, dto);
        return this.findOne(tenantId, id) as Promise<Professional>;
    }

    async deactivate(tenantId: string, id: string): Promise<Professional> {
        return this.update(tenantId, id, { active: false });
    }
}
