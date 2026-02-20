import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
    UpdateDateColumn, DeleteDateColumn,
} from 'typeorm';

export enum PaymentStatus {
    OPEN = 'OPEN',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE',
    NEGOTIATION = 'NEGOTIATION',
    CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
    CASH = 'CASH',
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    PIX = 'PIX',
    BANK_SLIP = 'BANK_SLIP',
    INSURANCE = 'INSURANCE',
}

@Entity('accounts_receivable')
export class AccountReceivable {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @Column({ name: 'attendance_id' })
    attendanceId: string;

    @Column({ name: 'patient_id' })
    patientId: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
    paymentMethod: PaymentMethod;

    @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.OPEN })
    status: PaymentStatus;

    @Column({ name: 'due_date', type: 'date' })
    dueDate: Date;

    @Column({ name: 'paid_at', type: 'datetime', nullable: true })
    paidAt: Date;

    @Column({ type: 'int', default: 1 })
    installments: number;

    @Column({ name: 'insurance_id', nullable: true })
    insuranceId: string;

    @Column({ name: 'professional_id', nullable: true })
    professionalId: string;

    @Column({ name: 'commission_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    commissionAmount: number;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;
}
