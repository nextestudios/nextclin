import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
    ManyToOne, JoinColumn,
} from 'typeorm';
import { Attendance } from './attendance.entity';
import { Batch } from '../../vaccines/entities/batch.entity';

@Entity('applications')
export class Application {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @Column({ name: 'attendance_id' })
    attendanceId: string;

    @ManyToOne(() => Attendance, (a) => a.applications)
    @JoinColumn({ name: 'attendance_id' })
    attendance: Attendance;

    @Column({ name: 'vaccine_id' })
    vaccineId: string;

    @Column({ name: 'batch_id' })
    batchId: string;

    @ManyToOne(() => Batch)
    @JoinColumn({ name: 'batch_id' })
    batch: Batch;

    @Column({ name: 'dose_number', type: 'int' })
    doseNumber: number;

    @Column({ name: 'application_route', nullable: true })
    applicationRoute: string;

    @Column({ name: 'application_site', nullable: true })
    applicationSite: string;

    @Column({ name: 'professional_id' })
    professionalId: string;

    @Column({ name: 'applied_at', type: 'datetime' })
    appliedAt: Date;

    @Column({ name: 'next_dose_date', type: 'date', nullable: true })
    nextDoseDate: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
