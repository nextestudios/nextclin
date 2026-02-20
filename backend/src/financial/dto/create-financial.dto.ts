import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsBoolean } from 'class-validator';
import { PaymentMethod } from '../entities/account-receivable.entity';

export class CreateReceivableDto {
    @IsString()
    attendanceId: string;

    @IsString()
    patientId: string;

    @IsNumber()
    amount: number;

    @IsEnum(PaymentMethod)
    @IsOptional()
    paymentMethod?: PaymentMethod;

    @IsDateString()
    dueDate: string;

    @IsNumber()
    @IsOptional()
    installments?: number;

    @IsString()
    @IsOptional()
    insuranceId?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class CreatePayableDto {
    @IsString()
    description: string;

    @IsNumber()
    amount: number;

    @IsString()
    @IsOptional()
    costCenter?: string;

    @IsString()
    @IsOptional()
    unitId?: string;

    @IsDateString()
    dueDate: string;

    @IsBoolean()
    @IsOptional()
    recurring?: boolean;

    @IsString()
    @IsOptional()
    notes?: string;
}
