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

    @Column({ default: true })
    active: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
