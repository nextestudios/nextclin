import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
    UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Application } from './application.entity';

export enum AttendanceStatus {
    WAITING = 'WAITING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export enum AttendancePriority {
    HIGH = 'HIGH',
    MEDIUM = 'MEDIUM',
    LOW = 'LOW',
    ELECTIVE = 'ELECTIVE',
}

@Entity('attendances')
export class Attendance {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @Column({ unique: true })
    code: string;

    @Column({ name: 'patient_id' })
    patientId: string;

    @ManyToOne(() => Patient, (p) => p.attendances)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @Column({ name: 'professional_id' })
    professionalId: string;

    @Column({ name: 'unit_id' })
    unitId: string;

    @Column({ name: 'appointment_id', nullable: true })
    appointmentId: string;

    @Column({ type: 'enum', enum: AttendanceStatus, default: AttendanceStatus.WAITING })
    status: AttendanceStatus;

    @Column({ type: 'enum', enum: AttendancePriority, default: AttendancePriority.MEDIUM })
    priority: AttendancePriority;

    @OneToMany(() => Application, (a) => a.attendance)
    applications: Application[];

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;
}
