import { Controller, Get, Post, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Public } from '../auth/public.decorator';
import { Patient } from '../patients/entities/patient.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import * as crypto from 'crypto';

/**
 * Portal do Paciente — Public endpoints for patient self-service.
 * Login by CPF + OTP code (sent via WhatsApp/SMS).
 */
@Controller('portal')
export class PortalController {
    private otpStore = new Map<string, { code: string; expires: Date }>();

    constructor(
        @InjectRepository(Patient)
        private patientsRepo: Repository<Patient>,
        @InjectRepository(Appointment)
        private appointmentsRepo: Repository<Appointment>,
    ) { }

    /** Request OTP via CPF */
    @Public()
    @Post('auth/request-otp')
    async requestOtp(@Body() dto: { cpf: string }) {
        const patient = await this.patientsRepo.findOne({ where: { cpf: dto.cpf } });
        if (!patient) throw new BadRequestException('CPF não encontrado.');

        const code = crypto.randomInt(100000, 999999).toString();
        this.otpStore.set(dto.cpf, { code, expires: new Date(Date.now() + 5 * 60 * 1000) });

        // TODO: Send via WhatsApp/SMS using MessagingService
        console.log(`[PORTAL OTP] ${dto.cpf}: ${code}`);

        return { success: true, message: 'Código enviado para seu WhatsApp/SMS.' };
    }

    /** Verify OTP and get patient data */
    @Public()
    @Post('auth/verify-otp')
    async verifyOtp(@Body() dto: { cpf: string; code: string }) {
        const stored = this.otpStore.get(dto.cpf);
        if (!stored || stored.code !== dto.code || new Date() > stored.expires) {
            throw new BadRequestException('Código inválido ou expirado.');
        }
        this.otpStore.delete(dto.cpf);

        const patient = await this.patientsRepo.findOne({
            where: { cpf: dto.cpf },
            relations: ['appointments'],
        });
        if (!patient) throw new BadRequestException('Paciente não encontrado.');

        return {
            authenticated: true,
            patient: {
                id: patient.id,
                name: patient.name,
                prontuario: patient.prontuario,
                birthDate: patient.birthDate,
            },
            token: `portal-${crypto.randomBytes(32).toString('hex')}`,
        };
    }

    /** Get patient vaccination card */
    @Public()
    @Get('patients/:cpf/vaccines')
    async getVaccinationCard(@Param('cpf') cpf: string) {
        const patient = await this.patientsRepo.findOne({
            where: { cpf },
            relations: ['attendances'],
        });
        if (!patient) throw new BadRequestException('Paciente não encontrado.');

        return {
            patient: { name: patient.name, prontuario: patient.prontuario },
            // In production: query Applications entity with vaccine details
            message: 'Carteira de vacinação digital',
        };
    }

    /** Get patient upcoming appointments */
    @Public()
    @Get('patients/:cpf/appointments')
    async getAppointments(@Param('cpf') cpf: string) {
        const patient = await this.patientsRepo.findOne({ where: { cpf } });
        if (!patient) return [];

        return this.appointmentsRepo.find({
            where: { patientId: patient.id },
            order: { startTime: 'DESC' },
            take: 20,
        });
    }

    /** Request new appointment (self-service) */
    @Public()
    @Post('appointments/request')
    async requestAppointment(@Body() dto: { cpf: string; vaccineId: string; preferredDate: string; preferredTime?: string; type?: string }) {
        const patient = await this.patientsRepo.findOne({ where: { cpf: dto.cpf } });
        if (!patient) throw new BadRequestException('Paciente não encontrado.');

        const appt = this.appointmentsRepo.create({
            tenantId: patient.tenantId,
            patientId: patient.id,
            vaccineId: dto.vaccineId,
            startTime: new Date(`${dto.preferredDate}T${dto.preferredTime || '09:00'}:00`),
            endTime: new Date(`${dto.preferredDate}T${dto.preferredTime || '09:30'}:00`),
            status: 'REQUESTED' as any,
            type: (dto.type || 'CLINIC') as any,
            notes: 'Agendamento solicitado pelo Portal do Paciente',
        });

        await this.appointmentsRepo.save(appt);
        return { success: true, appointmentId: appt.id, message: 'Agendamento solicitado. A clínica entrará em contato para confirmar.' };
    }
}
