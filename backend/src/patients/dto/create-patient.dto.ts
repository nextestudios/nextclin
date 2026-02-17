import { IsString, IsOptional, IsDateString, IsEmail } from 'class-validator';

export class CreatePatientDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    cpf?: string;

    @IsDateString()
    @IsOptional()
    birthDate?: string;

    @IsString()
    @IsOptional()
    gender?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    state?: string;

    @IsString()
    @IsOptional()
    zipCode?: string;

    @IsString()
    @IsOptional()
    guardianName?: string;

    @IsString()
    @IsOptional()
    guardianCpf?: string;

    @IsString()
    @IsOptional()
    guardianPhone?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}
