import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { AttendancePriority } from '../entities/attendance.entity';

export class CreateAttendanceDto {
    @IsUUID()
    patientId: string;

    @IsString()
    professionalId: string;

    @IsString()
    unitId: string;

    @IsUUID()
    @IsOptional()
    appointmentId?: string;

    @IsEnum(AttendancePriority)
    @IsOptional()
    priority?: AttendancePriority;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class ApplyVaccineDto {
    @IsUUID()
    vaccineId: string;

    @IsUUID()
    batchId: string;

    @IsString()
    @IsOptional()
    professionalId?: string;

    doseNumber: number;

    @IsString()
    @IsOptional()
    applicationRoute?: string;

    @IsString()
    @IsOptional()
    applicationSite?: string;
}
