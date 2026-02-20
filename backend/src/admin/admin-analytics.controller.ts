import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuperAdminGuard } from './admin.guard';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Subscription } from '../tenants/entities/subscription.entity';
import { Attendance } from '../attendances/entities/attendance.entity';
import { MessageLog } from '../notifications/entities/message-log.entity';

@Controller('admin/analytics')
@UseGuards(SuperAdminGuard)
export class AdminAnalyticsController {
    constructor(
        @InjectRepository(Tenant) private tenantsRepo: Repository<Tenant>,
        @InjectRepository(Subscription) private subscriptionsRepo: Repository<Subscription>,
        @InjectRepository(Attendance) private attendancesRepo: Repository<Attendance>,
        @InjectRepository(MessageLog) private messageLogsRepo: Repository<MessageLog>,
    ) { }

    /** Global KPIs overview */
    @Get('overview')
    async getOverview() {
        const totalTenants = await this.tenantsRepo.count();
        const activeSubs = await this.subscriptionsRepo.count();

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // Attendances today (all tenants)
        const attendancesToday = await this.attendancesRepo
            .createQueryBuilder('a')
            .where('a.createdAt >= :today AND a.createdAt < :tomorrow', { today, tomorrow })
            .getCount();

        // Messages sent today
        const messagesToday = await this.messageLogsRepo
            .createQueryBuilder('m')
            .where('m.sentAt >= :today AND m.sentAt < :tomorrow', { today, tomorrow })
            .getCount();

        // Subscriptions by plan
        const subsByPlan = await this.subscriptionsRepo
            .createQueryBuilder('s')
            .select('s.plan, COUNT(s.id) as count')
            .groupBy('s.plan')
            .getRawMany();

        // Estimated MRR (usage-based)
        const priceMap: Record<string, number> = { FREE: 0, PRO: 297, ENTERPRISE: 697 };
        const mrr = subsByPlan.reduce((acc, row) => acc + (priceMap[row.s_plan] || 0) * parseInt(row.count), 0);

        return {
            totalTenants,
            activeTenants: activeSubs,
            attendancesToday,
            messagesToday,
            estimatedMrr: mrr,
            subsByPlan,
            generatedAt: new Date(),
        };
    }

    /** Tenant growth — registrations per month (last 12) */
    @Get('growth')
    async getGrowth() {
        const result = await this.tenantsRepo
            .createQueryBuilder('t')
            .select("DATE_FORMAT(t.createdAt, '%Y-%m') as month, COUNT(t.id) as newTenants")
            .where("t.createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)")
            .groupBy('month')
            .orderBy('month', 'ASC')
            .getRawMany();
        return result;
    }

    /** Top 10 tenants by attendance volume */
    @Get('top-tenants')
    async getTopTenants() {
        const result = await this.attendancesRepo
            .createQueryBuilder('a')
            .select('a.tenantId, COUNT(a.id) as total')
            .groupBy('a.tenantId')
            .orderBy('total', 'DESC')
            .limit(10)
            .getRawMany();

        // Enrich with tenant names
        const enriched = await Promise.all(result.map(async (row) => {
            const tenant = await this.tenantsRepo.findOne({ where: { id: row.a_tenantId } });
            return { tenantId: row.a_tenantId, tenantName: tenant?.name || 'N/A', total: parseInt(row.total) };
        }));

        return enriched;
    }
}
