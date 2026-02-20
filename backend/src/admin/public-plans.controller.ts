import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanConfig } from './entities/plan-config.entity';
import { Public } from '../auth/public.decorator';

@Controller('public/plans')
export class PublicPlansController {
    constructor(
        @InjectRepository(PlanConfig) private planConfigsRepo: Repository<PlanConfig>,
    ) { }

    @Public()
    @Get()
    async getPublicPlans() {
        const dbConfigs = await this.planConfigsRepo.find();

        // Define default base plans in case DB is empty
        const defaultPlans = [
            { plan: 'FREE', name: 'Gratuito', price: 0, maxUnits: 1, maxProfessionals: 3, maxPatients: 50, features: ['Agendamentos', 'Controle de estoque'] },
            { plan: 'PRO', name: 'Profissional', price: 297, maxUnits: null, maxProfessionals: 10, maxPatients: null, features: ['WhatsApp automático', 'NFSe integrada', 'Dashboard assistencial'] },
            { plan: 'ENTERPRISE', name: 'Enterprise', price: 697, maxUnits: null, maxProfessionals: null, maxPatients: null, features: ['Tudo do Pro', 'API pública', 'Gestor de conta'] }
        ];

        return defaultPlans.map(def => {
            const dbConf = dbConfigs.find(c => c.plan === def.plan);
            if (dbConf) {
                return {
                    plan: dbConf.plan,
                    name: dbConf.name,
                    price: dbConf.price,
                    maxUnits: dbConf.maxUnits,
                    maxProfessionals: dbConf.maxProfessionals,
                    maxPatients: dbConf.maxPatients,
                    features: dbConf.features
                };
            }
            return def;
        });
    }
}
