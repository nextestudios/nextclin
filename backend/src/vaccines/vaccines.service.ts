import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vaccine } from './entities/vaccine.entity';
import { Batch } from './entities/batch.entity';

@Injectable()
export class VaccinesService {
    constructor(
        @InjectRepository(Vaccine)
        private vaccinesRepo: Repository<Vaccine>,
        @InjectRepository(Batch)
        private batchesRepo: Repository<Batch>,
    ) { }

    async createVaccine(tenantId: string, dto: any): Promise<Vaccine> {
        const vaccine = this.vaccinesRepo.create({ ...dto, tenantId });
        const saved = await this.vaccinesRepo.save(vaccine);
        return Array.isArray(saved) ? saved[0] : saved;
    }

    async findAllVaccines(tenantId: string): Promise<Vaccine[]> {
        return this.vaccinesRepo.find({ where: { tenantId, active: true }, relations: ['batches'] });
    }

    async createBatch(tenantId: string, dto: any): Promise<Batch> {
        const batch = this.batchesRepo.create({ ...dto, tenantId });
        const saved = await this.batchesRepo.save(batch);
        return Array.isArray(saved) ? saved[0] : saved;
    }

    async findBatchesByVaccine(tenantId: string, vaccineId: string): Promise<Batch[]> {
        return this.batchesRepo.find({ where: { tenantId, vaccineId } });
    }

    async updateVaccine(tenantId: string, id: string, dto: any): Promise<Vaccine> {
        await this.vaccinesRepo.update({ id, tenantId }, dto);
        return this.vaccinesRepo.findOne({ where: { id, tenantId } }) as Promise<Vaccine>;
    }

    async deleteVaccine(tenantId: string, id: string): Promise<void> {
        await this.vaccinesRepo.update({ id, tenantId }, { active: false });
    }

    async getLowStockVaccines(tenantId: string): Promise<any[]> {
        const vaccines = await this.vaccinesRepo.find({
            where: { tenantId, active: true },
            relations: ['batches'],
        });
        return vaccines
            .map(v => {
                const totalAvailable = (v.batches || []).reduce((sum, b) => sum + (Number(b.quantityAvailable) || 0), 0);
                return { ...v, totalAvailable };
            })
            .filter(v => v.totalAvailable < v.minimumStock);
    }

    async getExpiringBatches(tenantId: string, daysAhead: number): Promise<Batch[]> {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + daysAhead);
        return this.batchesRepo.createQueryBuilder('b')
            .where('b.tenant_id = :tenantId', { tenantId })
            .andWhere('b.expiry_date <= :futureDate', { futureDate })
            .andWhere('b.quantity_available > 0')
            .orderBy('b.expiry_date', 'ASC')
            .getMany();
    }
}
