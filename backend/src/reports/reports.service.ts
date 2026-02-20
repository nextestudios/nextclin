import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual } from 'typeorm';
import { Application } from '../attendances/entities/application.entity';
import { AccountReceivable, PaymentStatus } from '../financial/entities/account-receivable.entity';
import { Batch } from '../vaccines/entities/batch.entity';
import { Vaccine } from '../vaccines/entities/vaccine.entity';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Application)
        private applicationsRepo: Repository<Application>,
        @InjectRepository(AccountReceivable)
        private arRepo: Repository<AccountReceivable>,
        @InjectRepository(Batch)
        private batchesRepo: Repository<Batch>,
        @InjectRepository(Vaccine)
        private vaccinesRepo: Repository<Vaccine>,
    ) { }

    async vaccinesApplied(tenantId: string, dateFrom?: string, dateTo?: string) {
        const qb = this.applicationsRepo.createQueryBuilder('app')
            .select('app.vaccine_id', 'vaccineId')
            .addSelect('COUNT(*)', 'totalApplications')
            .addSelect('app.dose_number', 'doseNumber')
            .where('app.tenant_id = :tenantId', { tenantId });

        if (dateFrom && dateTo) {
            qb.andWhere('app.applied_at BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo });
        }

        const raw = await qb
            .groupBy('app.vaccine_id')
            .addGroupBy('app.dose_number')
            .orderBy('totalApplications', 'DESC')
            .getRawMany();

        return raw;
    }

    async overdueReceivables(tenantId: string) {
        return this.arRepo.find({
            where: {
                tenantId,
                status: PaymentStatus.OVERDUE,
            },
            order: { dueDate: 'ASC' },
        });
    }

    async stockSummary(tenantId: string) {
        const batches = await this.batchesRepo.createQueryBuilder('b')
            .leftJoinAndSelect('b.vaccine', 'v')
            .where('b.tenant_id = :tenantId', { tenantId })
            .andWhere('b.quantity_available > 0')
            .orderBy('b.expiry_date', 'ASC')
            .getMany();

        const expired = batches.filter(b => new Date(b.expiryDate) < new Date());
        const valid = batches.filter(b => new Date(b.expiryDate) >= new Date());

        return {
            totalBatches: batches.length,
            expiredBatches: expired.length,
            validBatches: valid.length,
            totalDoses: valid.reduce((sum, b) => sum + b.quantityAvailable, 0),
            batches: batches.map(b => ({
                id: b.id,
                vaccine: b.vaccine?.name,
                lotNumber: b.lotNumber,
                expiryDate: b.expiryDate,
                quantity: b.quantityAvailable,
                expired: new Date(b.expiryDate) < new Date(),
            })),
        };
    }

    async commissionReport(tenantId: string, dateFrom?: string, dateTo?: string) {
        const qb = this.arRepo.createQueryBuilder('ar')
            .select('ar.professional_id', 'professionalId')
            .addSelect('COUNT(*)', 'totalAttendances')
            .addSelect('SUM(ar.amount)', 'totalRevenue')
            .addSelect('SUM(ar.commission_amount)', 'totalCommission')
            .where('ar.tenant_id = :tenantId', { tenantId })
            .andWhere('ar.status = :status', { status: PaymentStatus.PAID })
            .andWhere('ar.professional_id IS NOT NULL');

        if (dateFrom && dateTo) {
            qb.andWhere('ar.paid_at BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo });
        }

        return qb
            .groupBy('ar.professional_id')
            .orderBy('totalCommission', 'DESC')
            .getRawMany();
    }

    async lowStockAlerts(tenantId: string) {
        const vaccines = await this.vaccinesRepo.find({
            where: { tenantId, active: true },
            relations: ['batches'],
        });

        return vaccines
            .map(v => {
                const totalStock = (v.batches || [])
                    .filter(b => new Date(b.expiryDate) >= new Date())
                    .reduce((sum, b) => sum + b.quantityAvailable, 0);
                return {
                    vaccineId: v.id,
                    vaccineName: v.name,
                    totalStock,
                    minimumStock: v.minimumStock,
                    belowMinimum: totalStock < v.minimumStock,
                };
            })
            .filter(v => v.belowMinimum);
    }
}
