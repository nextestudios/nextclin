import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { AccountReceivable, PaymentStatus } from './entities/account-receivable.entity';
import { AccountPayable, PayableStatus } from './entities/account-payable.entity';

@Injectable()
export class FinancialService {
    constructor(
        @InjectRepository(AccountReceivable)
        private arRepo: Repository<AccountReceivable>,
        @InjectRepository(AccountPayable)
        private apRepo: Repository<AccountPayable>,
    ) { }

    // --- Accounts Receivable ---
    async createReceivable(tenantId: string, dto: any): Promise<AccountReceivable> {
        const ar = this.arRepo.create({ ...dto, tenantId });
        const saved = await this.arRepo.save(ar);
        return Array.isArray(saved) ? saved[0] : saved;
    }

    async findAllReceivables(tenantId: string, status?: string): Promise<AccountReceivable[]> {
        const where: any = { tenantId };
        if (status) where.status = status;
        return this.arRepo.find({ where, order: { dueDate: 'ASC' } });
    }

    async markAsPaid(tenantId: string, id: string): Promise<AccountReceivable> {
        await this.arRepo.update({ id, tenantId }, { status: PaymentStatus.PAID, paidAt: new Date() });
        return this.arRepo.findOne({ where: { id, tenantId } }) as Promise<AccountReceivable>;
    }

    async getOverdueReceivables(tenantId: string): Promise<AccountReceivable[]> {
        return this.arRepo.find({
            where: { tenantId, status: PaymentStatus.OPEN, dueDate: LessThanOrEqual(new Date()) },
            order: { dueDate: 'ASC' },
        });
    }

    // --- Accounts Payable ---
    async createPayable(tenantId: string, dto: any): Promise<AccountPayable> {
        const ap = this.apRepo.create({ ...dto, tenantId });
        const saved = await this.apRepo.save(ap);
        return Array.isArray(saved) ? saved[0] : saved;
    }

    async findAllPayables(tenantId: string, status?: string): Promise<AccountPayable[]> {
        const where: any = { tenantId };
        if (status) where.status = status;
        return this.apRepo.find({ where, order: { dueDate: 'ASC' } });
    }

    async markPayableAsPaid(tenantId: string, id: string): Promise<AccountPayable> {
        await this.apRepo.update({ id, tenantId }, { status: PayableStatus.PAID, paidAt: new Date() });
        return this.apRepo.findOne({ where: { id, tenantId } }) as Promise<AccountPayable>;
    }

    // --- Dashboard Stats ---
    async getDashboardStats(tenantId: string) {
        const totalReceivable = await this.arRepo.createQueryBuilder('ar')
            .select('SUM(ar.amount)', 'total')
            .where('ar.tenant_id = :tenantId AND ar.status = :status', { tenantId, status: PaymentStatus.OPEN })
            .getRawOne();

        const totalReceived = await this.arRepo.createQueryBuilder('ar')
            .select('SUM(ar.amount)', 'total')
            .where('ar.tenant_id = :tenantId AND ar.status = :status', { tenantId, status: PaymentStatus.PAID })
            .getRawOne();

        const totalPayable = await this.apRepo.createQueryBuilder('ap')
            .select('SUM(ap.amount)', 'total')
            .where('ap.tenant_id = :tenantId AND ap.status = :status', { tenantId, status: PayableStatus.PENDING })
            .getRawOne();

        const overdue = await this.getOverdueReceivables(tenantId);

        return {
            totalReceivable: totalReceivable?.total || 0,
            totalReceived: totalReceived?.total || 0,
            totalPayable: totalPayable?.total || 0,
            overdueCount: overdue.length,
        };
    }
}
