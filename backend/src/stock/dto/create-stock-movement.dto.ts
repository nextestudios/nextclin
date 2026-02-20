import { IsString, IsNumber, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { MovementReason } from '../entities/stock-movement.entity';

export class CreateStockMovementDto {
    @IsUUID()
    batchId: string;

    @IsEnum(MovementReason)
    reason: MovementReason;

    @IsNumber()
    quantity: number;

    @IsString()
    @IsOptional()
    notes?: string;
}
