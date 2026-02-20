import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ProfessionalType {
    DOCTOR = 'DOCTOR',
    NURSE = 'NURSE',
    TECHNICIAN = 'TECHNICIAN',
}

@Entity('professionals')
export class Professional {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @Column()
    name: string;

    @Column({ type: 'enum', enum: ProfessionalType })
    type: ProfessionalType;

    @Column({ name: 'council_number', nullable: true })
    councilNumber: string;

    @Column({ nullable: true })
    specialty: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    email: string;

    @Column({ name: 'commission_percent', type: 'decimal', precision: 5, scale: 2, default: 0 })
    commissionPercent: number;

    @Column({ default: true })
    active: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
