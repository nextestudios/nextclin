import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, PlanTier } from './entities/subscription.entity';
import { PlanConfig } from '../admin/entities/plan-config.entity';

@Controller('subscription')
@UseGuards(AuthGuard('jwt'))
export class SubscriptionController {
    constructor(
        @InjectRepository(Subscription)
        private subsRepo: Repository<Subscription>,
        @InjectRepository(PlanConfig)
        private planConfigsRepo: Repository<PlanConfig>,
    ) { }

    @Get()
    async getCurrent(@Request() req: any) {
        const tenantId = req.user.tenantIds?.[0];
        let sub = await this.subsRepo.findOne({ where: { tenantId } });

        // Auto-create free plan if none exists
        if (!sub) {
            sub = this.subsRepo.create({
                tenantId,
                plan: PlanTier.FREE,
                maxPatients: 50,
                maxUnits: 1,
                maxProfessionals: 3,
                monthlyPrice: 0,
                trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            });
            await this.subsRepo.save(sub);
        }

        return sub;
    }

    @Get('plans')
    async getPlans() {
        const dbConfigs = await this.planConfigsRepo.find();

        const defaults = [
            {
                tier: 'FREE',
                name: 'Gratuito',
                price: 0,
                features: ['1 unidade', '50 pacientes', '3 profissionais', 'Suporte por email'],
                limits: { maxPatients: 50, maxUnits: 1, maxProfessionals: 3 },
            },
            {
                tier: 'PRO',
                name: 'Profissional',
                price: 297,
                features: ['Unidades ilimitadas', 'Pacientes ilimitados', '10 profissionais', 'WhatsApp ativo', 'NFSe automática', 'Suporte prioritário'],
                limits: { maxPatients: 99999, maxUnits: 99, maxProfessionals: 10 },
                popular: true,
            },
            {
                tier: 'ENTERPRISE',
                name: 'Enterprise',
                price: 697,
                features: ['Tudo do Pro', 'Profissionais ilimitados', 'API pública', 'White-label', 'Gestor de conta dedicado', 'SLA 99.9%'],
                limits: { maxPatients: 99999, maxUnits: 99, maxProfessionals: 99999 },
            },
        ];

        return defaults.map(def => {
            const dbConf = dbConfigs.find(c => c.plan === def.tier);
            if (dbConf) {
                return {
                    tier: dbConf.plan,
                    name: dbConf.name,
                    price: dbConf.price,
                    features: dbConf.features || def.features,
                    limits: {
                        maxPatients: dbConf.maxPatients ?? def.limits.maxPatients,
                        maxUnits: dbConf.maxUnits ?? def.limits.maxUnits,
                        maxProfessionals: dbConf.maxProfessionals ?? def.limits.maxProfessionals,
                    },
                    popular: def.tier === 'PRO',
                };
            }
            return def;
        });
    }
}

