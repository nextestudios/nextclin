import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateVaccineDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    manufacturer?: string;

    @IsNumber()
    @IsOptional()
    doseIntervalDays?: number;

    @IsNumber()
    @IsOptional()
    totalDoses?: number;

    @IsNumber()
    @IsOptional()
    costPrice?: number;

    @IsNumber()
    @IsOptional()
    salePrice?: number;

    @IsBoolean()
    @IsOptional()
    active?: boolean;
}

export class CreateBatchDto {
    @IsString()
    vaccineId: string;

    @IsString()
    lotNumber: string;

    @IsString()
    expiryDate: string;

    @IsNumber()
    @IsOptional()
    quantityAvailable?: number;

    @IsString()
    @IsOptional()
    unitId?: string;
}
