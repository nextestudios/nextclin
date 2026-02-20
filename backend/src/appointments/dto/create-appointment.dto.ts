import { IsString, IsOptional, IsDateString, IsEnum, IsNumber, IsUUID } from 'class-validator';
import { AppointmentType } from '../entities/appointment.entity';

export class CreateAppointmentDto {
    @IsUUID()
    patientId: string;

    @IsString()
    professionalId: string;

    @IsString()
    unitId: string;

    @IsUUID()
    @IsOptional()
    vaccineId?: string;

    @IsEnum(AppointmentType)
    @IsOptional()
    type?: AppointmentType;

    @IsDateString()
    startTime: string;

    @IsDateString()
    endTime: string;

    @IsString()
    @IsOptional()
    homeAddress?: string;

    @IsNumber()
    @IsOptional()
    displacementFee?: number;

    @IsString()
    @IsOptional()
    notes?: string;
}
