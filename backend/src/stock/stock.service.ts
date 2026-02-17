import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovement, MovementType, MovementReason } from './entities/stock-movement.entity';
import { Batch } from '../vaccines/entities/batch.entity';

@Injectable()
export class StockService {
    constructor(
        @InjectRepository(StockMovement)
        private movementsRepo: Repository<StockMovement>,
        @InjectRepository(Batch)
        private batchesRepo: Repository<Batch>,
    ) { }

    async addEntry(tenantId: string, batchId: string, quantity: number, reason: MovementReason, userId: string, notes?: string) {
        const batch = await this.batchesRepo.findOne({ where: { id: batchId, tenantId } });
        if (!batch) throw new BadRequestException('Lote não encontrado.');

        batch.quantityAvailable += quantity;
        await this.batchesRepo.save(batch);

        const movement = this.movementsRepo.create({
            tenantId, batchId, type: MovementType.ENTRY, reason, quantity, userId, notes,
        });
        return this.movementsRepo.save(movement);
    }

    async addExit(tenantId: string, batchId: string, quantity: number, reason: MovementReason, userId: string, notes?: string) {
        const batch = await this.batchesRepo.findOne({ where: { id: batchId, tenantId } });
        if (!batch) throw new BadRequestException('Lote não encontrado.');

        // Check expiry
        if (new Date(batch.expiryDate) < new Date()) {
            throw new BadRequestException('Lote VENCIDO! Não é possível aplicar vacina com lote vencido.');
        }

        if (batch.quantityAvailable < quantity) {
            throw new BadRequestException(`Estoque insuficiente. Disponível: ${batch.quantityAvailable}`);
        }

        batch.quantityAvailable -= quantity;
        await this.batchesRepo.save(batch);

        const movement = this.movementsRepo.create({
            tenantId, batchId, type: MovementType.EXIT, reason, quantity, userId, notes,
        });
        return this.movementsRepo.save(movement);
    }

    async getMovements(tenantId: string, batchId?: string): Promise<StockMovement[]> {
        const where: any = { tenantId };
        if (batchId) where.batchId = batchId;
        return this.movementsRepo.find({ where, relations: ['batch'], order: { createdAt: 'DESC' } });
    }
}
