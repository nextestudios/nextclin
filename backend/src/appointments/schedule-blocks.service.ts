import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleBlock } from './entities/schedule-block.entity';

@Injectable()
export class ScheduleBlocksService {
    constructor(
        @InjectRepository(ScheduleBlock)
        private blocksRepo: Repository<ScheduleBlock>,
    ) { }

    async create(tenantId: string, dto: any): Promise<ScheduleBlock> {
        const block = this.blocksRepo.create({ ...dto, tenantId });
        const saved = await this.blocksRepo.save(block);
        return Array.isArray(saved) ? saved[0] : saved;
    }

    async findAll(tenantId: string, filters?: { professionalId?: string; unitId?: string }): Promise<ScheduleBlock[]> {
        const qb = this.blocksRepo.createQueryBuilder('sb')
            .where('sb.tenant_id = :tenantId', { tenantId });

        if (filters?.professionalId) {
            qb.andWhere('(sb.professional_id = :profId OR sb.professional_id IS NULL)', { profId: filters.professionalId });
        }
        if (filters?.unitId) {
            qb.andWhere('(sb.unit_id = :unitId OR sb.unit_id IS NULL)', { unitId: filters.unitId });
        }

        return qb.orderBy('sb.start_date', 'ASC').getMany();
    }

    async isBlocked(tenantId: string, professionalId: string, date: Date): Promise<ScheduleBlock | null> {
        const dateStr = date.toISOString().split('T')[0];
        return this.blocksRepo.createQueryBuilder('sb')
            .where('sb.tenant_id = :tenantId', { tenantId })
            .andWhere('(sb.professional_id = :profId OR sb.professional_id IS NULL)', { profId: professionalId })
            .andWhere('sb.start_date <= :date AND sb.end_date >= :date', { date: dateStr })
            .getOne();
    }

    async delete(tenantId: string, id: string): Promise<void> {
        await this.blocksRepo.delete({ id, tenantId });
    }
}
