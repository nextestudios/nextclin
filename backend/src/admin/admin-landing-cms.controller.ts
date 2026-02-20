import { Controller, Get, Put, Post, Body, Param, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuperAdminGuard } from './admin.guard';
import { LandingPageConfig } from './entities/landing-page-config.entity';
import { Public } from '../auth/public.decorator';

/** Default Landing Page config — loaded on first run if DB is empty */
const LANDING_DEFAULTS: Array<{ section: string; key: string; value: string; type: string }> = [
    { section: 'hero', key: 'badge', value: 'SaaS para Clínicas de Vacinação', type: 'text' },
    { section: 'hero', key: 'title_line1', value: 'Gestão completa para', type: 'text' },
    { section: 'hero', key: 'title_line2', value: 'clínicas de vacinação', type: 'text' },
    { section: 'hero', key: 'subtitle', value: 'Agendamentos, estoque, financeiro, NFSe, notificações automáticas e muito mais. Tudo em um único sistema multi-tenant, seguro e compliant com LGPD.', type: 'textarea' },
    { section: 'hero', key: 'cta_primary', value: 'Começar grátis', type: 'text' },
    { section: 'hero', key: 'cta_secondary', value: 'Ver planos', type: 'text' },
    { section: 'pricing', key: 'title', value: 'Planos que cabem no seu bolso', type: 'text' },
    { section: 'pricing', key: 'subtitle', value: 'Comece grátis, escale quando precisar.', type: 'text' },
    { section: 'pricing', key: 'free_price', value: 'R$ 0', type: 'text' },
    { section: 'pricing', key: 'pro_price', value: 'R$ 297', type: 'text' },
    { section: 'pricing', key: 'enterprise_price', value: 'R$ 697', type: 'text' },
    { section: 'cta', key: 'title', value: 'Sua clínica merece o melhor', type: 'text' },
    { section: 'cta', key: 'subtitle', value: '14 dias grátis. Sem cartão de crédito. Configure em minutos.', type: 'text' },
    { section: 'cta', key: 'button', value: 'Começar agora', type: 'text' },
    { section: 'features', key: 'title', value: 'Tudo que sua clínica precisa', type: 'text' },
    { section: 'features', key: 'subtitle', value: 'Sistema completo para gestão de clínicas de vacinação, do agendamento ao financeiro.', type: 'textarea' },
];

@Controller('admin/landing-cms')
export class AdminLandingCmsController {
    constructor(
        @InjectRepository(LandingPageConfig)
        private cmsRepo: Repository<LandingPageConfig>,
    ) { }

    /** Public endpoint — Landing Page fetches from here for real-time CMS */
    @Public()
    @Get()
    async getAll() {
        let configs = await this.cmsRepo.find();

        // Seed defaults if empty
        if (configs.length === 0) {
            const items = this.cmsRepo.create(LANDING_DEFAULTS);
            configs = await this.cmsRepo.save(items);
        }

        // Group by section
        const grouped: Record<string, Record<string, string>> = {};
        for (const cfg of configs) {
            if (!grouped[cfg.section]) grouped[cfg.section] = {};
            grouped[cfg.section][cfg.key] = cfg.value;
        }

        return grouped;
    }

    /** Update a specific config key */
    @UseGuards(SuperAdminGuard)
    @Put(':section/:key')
    async update(
        @Param('section') section: string,
        @Param('key') key: string,
        @Body() dto: { value: string },
    ) {
        let config = await this.cmsRepo.findOne({ where: { section, key } });
        if (!config) {
            config = this.cmsRepo.create({ section, key, value: dto.value });
        } else {
            config.value = dto.value;
        }
        await this.cmsRepo.save(config);
        return { success: true, section, key, value: dto.value };
    }

    /** Reset all to defaults */
    @UseGuards(SuperAdminGuard)
    @Post('reset')
    async reset() {
        await this.cmsRepo.delete({});
        const items = this.cmsRepo.create(LANDING_DEFAULTS);
        await this.cmsRepo.save(items);
        return { success: true, message: 'Landing Page resetada para os valores padrão.' };
    }
}
