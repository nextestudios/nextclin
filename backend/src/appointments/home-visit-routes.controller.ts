import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Appointment, AppointmentType } from './entities/appointment.entity';

/**
 * Home Visit Route Optimization
 * Groups home visit appointments by region (CEP prefix) for efficient routing.
 */
@Controller('appointments/routes')
@UseGuards(AuthGuard('jwt'))
export class HomeVisitRoutesController {
    constructor(
        @InjectRepository(Appointment)
        private appointmentsRepo: Repository<Appointment>,
    ) { }

    /** Get optimized routes for a date — groups home visits by CEP region */
    @Get()
    async getRoutes(@Request() req: any, @Query('date') date: string) {
        const tenantId = req.user.tenantIds?.[0];
        const targetDate = date || new Date().toISOString().split('T')[0];

        const homeVisits = await this.appointmentsRepo.find({
            where: {
                tenantId,
                type: AppointmentType.HOME,
                status: In(['REQUESTED', 'CONFIRMED']),
            },
            relations: ['patient', 'professional'],
            order: { startTime: 'ASC' },
        });

        // Filter by date
        const dayVisits = homeVisits.filter(v => {
            const apptDate = new Date(v.startTime).toISOString().split('T')[0];
            return apptDate === targetDate;
        });

        // Group by CEP prefix (first 5 digits = same region)
        const regionGroups = new Map<string, typeof dayVisits>();
        for (const visit of dayVisits) {
            const cep = (visit.homeAddress || '').match(/\d{5}/)?.[0] || 'SEM-CEP';
            const existing = regionGroups.get(cep) || [];
            existing.push(visit);
            regionGroups.set(cep, existing);
        }

        // Build route suggestions
        const routes = Array.from(regionGroups.entries()).map(([region, visits]) => ({
            region: `CEP ${region}-xxx`,
            totalVisits: visits.length,
            estimatedTime: `${visits.length * 45} min`, // ~45 min per visit
            estimatedDistance: `${visits.length * 5} km`, // ~5 km between visits (rough)
            visits: visits.map(v => ({
                id: v.id,
                patient: v.patient?.name || 'N/A',
                address: v.homeAddress,
                time: new Date(v.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                professional: (v as any).professional?.name || v.professionalId || 'N/A',
                displacementFee: v.displacementFee,
            })),
        }));

        return {
            date: targetDate,
            totalRoutes: routes.length,
            totalVisits: dayVisits.length,
            routes,
        };
    }

    /** Calculate displacement fee based on CEP distance (mock) */
    @Get('calculate-fee')
    calculateFee(@Query('originCep') originCep: string, @Query('destCep') destCep: string) {
        // Mock: calculate based on CEP difference (real implementation would use Google Maps API)
        const origin = parseInt(originCep?.replace(/\D/g, '') || '0');
        const dest = parseInt(destCep?.replace(/\D/g, '') || '0');
        const diff = Math.abs(origin - dest);
        const feePerKm = 2.5;
        const estimatedKm = Math.min(diff / 100, 50); // Cap at 50km
        const fee = Math.max(estimatedKm * feePerKm, 15); // Min R$15

        return {
            originCep, destCep,
            estimatedKm: estimatedKm.toFixed(1),
            feePerKm,
            totalFee: fee.toFixed(2),
            note: 'Estimativa. Configure GOOGLE_MAPS_API_KEY para cálculo preciso.',
        };
    }
}
