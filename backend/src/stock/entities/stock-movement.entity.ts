import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Batch } from '../../vaccines/entities/batch.entity';

export enum MovementType {
    ENTRY = 'ENTRY',
    EXIT = 'EXIT',
}

export enum MovementReason {
    PURCHASE = 'PURCHASE',
    RETURN = 'RETURN',
    APPLICATION = 'APPLICATION',
    LOSS = 'LOSS',
    EXPIRED = 'EXPIRED',
    ADJUSTMENT = 'ADJUSTMENT',
}

@Entity('stock_movements')
export class StockMovement {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @Column({ name: 'batch_id' })
    batchId: string;

    @ManyToOne(() => Batch)
    @JoinColumn({ name: 'batch_id' })
    batch: Batch;

    @Column({ type: 'enum', enum: MovementType })
    type: MovementType;

    @Column({ type: 'enum', enum: MovementReason })
    reason: MovementReason;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
