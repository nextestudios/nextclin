import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum PayableStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE',
    CANCELLED = 'CANCELLED',
}

@Entity('accounts_payable')
export class AccountPayable {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @Column()
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ name: 'cost_center', nullable: true })
    costCenter: string;

    @Column({ name: 'unit_id', nullable: true })
    unitId: string;

    @Column({ type: 'enum', enum: PayableStatus, default: PayableStatus.PENDING })
    status: PayableStatus;

    @Column({ name: 'due_date', type: 'date' })
    dueDate: Date;

    @Column({ name: 'paid_at', type: 'datetime', nullable: true })
    paidAt: Date;

    @Column({ type: 'boolean', default: false })
    recurring: boolean;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
