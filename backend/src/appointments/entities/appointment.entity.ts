import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
    UpdateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';

export enum AppointmentStatus {
    REQUESTED = 'REQUESTED',
    CONFIRMED = 'CONFIRMED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    NO_SHOW = 'NO_SHOW',
}

export enum AppointmentType {
    CLINIC = 'CLINIC',
    HOME = 'HOME',
}

@Entity('appointments')
@Index(['tenantId', 'professionalId', 'startTime'])
export class Appointment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @Column({ name: 'patient_id' })
    patientId: string;

    @ManyToOne(() => Patient)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @Column({ name: 'professional_id' })
    professionalId: string;

    @Column({ name: 'unit_id' })
    unitId: string;

    @Column({ name: 'vaccine_id', nullable: true })
    vaccineId: string;

    @Column({ type: 'enum', enum: AppointmentType, default: AppointmentType.CLINIC })
    type: AppointmentType;

    @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.REQUESTED })
    status: AppointmentStatus;

    @Column({ name: 'start_time', type: 'datetime' })
    startTime: Date;

    @Column({ name: 'end_time', type: 'datetime' })
    endTime: Date;

    // Home visit fields
    @Column({ name: 'home_address', nullable: true })
    homeAddress: string;

    @Column({ name: 'displacement_fee', type: 'decimal', precision: 10, scale: 2, nullable: true })
    displacementFee: number;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
