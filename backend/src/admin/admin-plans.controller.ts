import { Controller, Get, Patch, Put, Body, Param, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuperAdminGuard } from './admin.guard';
import { Subscription, PlanTier } from '../tenants/entities/subscription.entity';
import { PlanConfig } from './entities/plan-config.entity';

const PLAN_DEFAULTS: Record<PlanTier, any> = {
    [PlanTier.FREE]: {
        name: 'Gratuito', price: 0, maxUnits: 1, maxProfessionals: 3, maxPatients: 50,
        features: ['Agendamentos', 'Estoque', 'Suporte por email'],
    },
    [PlanTier.PRO]: {
        name: 'Profissional', price: 297, maxUnits: null, maxProfessionals: 10, maxPatients: null,
        features: ['WhatsApp automático', 'NFSe integrada', 'Portal do Paciente', 'Dashboard assistencial', 'Suporte prioritário'],
    },
    [PlanTier.ENTERPRISE]: {
        name: 'Enterprise', price: 697, maxUnits: null, maxProfessionals: null, maxPatients: null,
        features: ['API pública', 'White-label', 'SSO/SAML', 'Gestor dedicado', 'SLA 99.9%'],
    },
};

@Controller('admin/plans')
@UseGuards(SuperAdminGuard)
export class AdminPlansController {
    constructor(
        @InjectRepository(Subscription)
        private subscriptionsRepo: Repository<Subscription>,
        @InjectRepository(PlanConfig)
        private planConfigsRepo: Repository<PlanConfig>,
    ) { }

    @Get()
    async getPlans() {
        const subscriptions = await this.subscriptionsRepo.find();
        const countByPlan = {
            FREE: subscriptions.filter(s => s.plan === PlanTier.FREE).length,
            PRO: subscriptions.filter(s => s.plan === PlanTier.PRO).length,
            ENTERPRISE: subscriptions.filter(s => s.plan === PlanTier.ENTERPRISE).length,
        };

        const dbConfigs = await this.planConfigsRepo.find();
        return Object.entries(PLAN_DEFAULTS).map(([planTier, defConfig]) => {
            const dbConf = dbConfigs.find(c => c.plan === planTier);
            return {
                plan: planTier,
                name: dbConf?.name ?? defConfig.name,
                price: dbConf?.price ?? defConfig.price,
                maxUnits: dbConf?.maxUnits !== undefined ? dbConf.maxUnits : defConfig.maxUnits,
                maxProfessionals: dbConf?.maxProfessionals !== undefined ? dbConf.maxProfessionals : defConfig.maxProfessionals,
                maxPatients: dbConf?.maxPatients !== undefined ? dbConf.maxPatients : defConfig.maxPatients,
                features: dbConf?.features ?? defConfig.features,
                activeTenants: countByPlan[planTier as PlanTier] || 0,
            };
        });
    }

    @Put(':plan')
    async updatePlanConfig(
        @Param('plan') plan: PlanTier,
        @Body() dto: { name: string; price: number; maxUnits: number | null; maxProfessionals: number | null; maxPatients: number | null; features: string[] }
    ) {
        let conf = await this.planConfigsRepo.findOne({ where: { plan } });
        if (!conf) {
            conf = this.planConfigsRepo.create({ plan });
        }
        conf.name = dto.name;
        conf.price = dto.price;
        conf.maxUnits = dto.maxUnits;
        conf.maxProfessionals = dto.maxProfessionals;
        conf.maxPatients = dto.maxPatients;
        conf.features = dto.features;
        await this.planConfigsRepo.save(conf);
        return { success: true, plan: conf };
    }

    @Patch(':tenantId/override')
    async overridePlan(
        @Param('tenantId') tenantId: string,
        @Body() dto: { plan: PlanTier; reason?: string },
    ) {
        let sub = await this.subscriptionsRepo.findOne({ where: { tenantId } });
        if (!sub) sub = this.subscriptionsRepo.create({ tenantId });
        sub.plan = dto.plan;
        await this.subscriptionsRepo.save(sub);
        return { success: true, tenantId, plan: dto.plan };
    }

    @Patch(':tenantId/limits')
    async updateLimits(
        @Param('tenantId') tenantId: string,
        @Body() dto: { maxUnits?: number; maxProfessionals?: number; maxPatients?: number },
    ) {
        let sub = await this.subscriptionsRepo.findOne({ where: { tenantId } });
        if (!sub) sub = this.subscriptionsRepo.create({ tenantId });
        if (dto.maxUnits !== undefined) sub.maxUnits = dto.maxUnits;
        if (dto.maxProfessionals !== undefined) sub.maxProfessionals = dto.maxProfessionals;
        if (dto.maxPatients !== undefined) sub.maxPatients = dto.maxPatients;
        await this.subscriptionsRepo.save(sub);
        return { success: true, tenantId, limits: dto };
    }

    @Get('trials')
    async getTrials() {
        const subs = await this.subscriptionsRepo.find();
        const now = new Date();
        return subs.filter(s => s.trialEndsAt && new Date(s.trialEndsAt) > now);
    }
}
