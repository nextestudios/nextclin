import { Controller, Get, Post, Put, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientConsent } from './entities/patient-consent.entity';

@Controller('patients')
@UseGuards(AuthGuard('jwt'))
export class PatientConsentsController {
    constructor(
        @InjectRepository(PatientConsent)
        private consentsRepo: Repository<PatientConsent>,
    ) { }

    @Get(':patientId/consents')
    findAll(@Request() req: any, @Param('patientId') patientId: string) {
        return this.consentsRepo.find({
            where: { tenantId: req.user.tenantIds?.[0], patientId },
            order: { createdAt: 'DESC' },
        });
    }

    @Post(':patientId/consents')
    create(@Request() req: any, @Param('patientId') patientId: string, @Body() dto: any) {
        const consent = this.consentsRepo.create({
            tenantId: req.user.tenantIds?.[0],
            patientId,
            consentType: dto.consentType,
            description: dto.description,
            accepted: dto.accepted || false,
            acceptedAt: dto.accepted ? new Date() : undefined,
            ipAddress: req.ip,
        });
        return this.consentsRepo.save(consent);
    }

    @Put(':patientId/consents/:id/revoke')
    async revoke(@Request() req: any, @Param('id') id: string) {
        const tenantId = req.user.tenantIds?.[0];
        await this.consentsRepo.update({ id, tenantId }, { revokedAt: new Date() });
        return { success: true };
    }

    // LGPD: Export patient data
    @Get(':patientId/data-export')
    async exportData(@Request() req: any, @Param('patientId') patientId: string) {
        const tenantId = req.user.tenantIds?.[0];
        const consents = await this.consentsRepo.find({ where: { tenantId, patientId } });
        return {
            patientId,
            consents,
            exportedAt: new Date().toISOString(),
            exportedBy: req.user.userId,
        };
    }
}
