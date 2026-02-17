import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum NfseStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    ISSUED = 'ISSUED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
}

@Entity('nfse')
export class Nfse {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @Column({ name: 'account_receivable_id' })
    accountReceivableId: string;

    @Column({ name: 'patient_id' })
    patientId: string;

    @Column({ name: 'nfse_number', nullable: true })
    nfseNumber: string;

    @Column({ type: 'text', nullable: true })
    xml: string;

    @Column({ name: 'pdf_url', nullable: true })
    pdfUrl: string;

    @Column({ nullable: true })
    protocol: string;

    @Column({ type: 'enum', enum: NfseStatus, default: NfseStatus.PENDING })
    status: NfseStatus;

    @Column({ type: 'int', default: 0 })
    retries: number;

    @Column({ name: 'last_error', type: 'text', nullable: true })
    lastError: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
