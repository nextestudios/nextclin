import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index,
} from 'typeorm';

export enum BlockType {
    HOLIDAY = 'HOLIDAY',
    VACATION = 'VACATION',
    UNAVAILABLE = 'UNAVAILABLE',
    MAINTENANCE = 'MAINTENANCE',
}

@Entity('schedule_blocks')
@Index(['tenantId', 'startDate'])
export class ScheduleBlock {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @Column({ name: 'professional_id', nullable: true })
    professionalId: string;

    @Column({ name: 'unit_id', nullable: true })
    unitId: string;

    @Column({ type: 'enum', enum: BlockType })
    type: BlockType;

    @Column()
    title: string;

    @Column({ name: 'start_date', type: 'date' })
    startDate: Date;

    @Column({ name: 'end_date', type: 'date' })
    endDate: Date;

    @Column({ name: 'all_day', default: true })
    allDay: boolean;

    @Column({ name: 'start_time', type: 'time', nullable: true })
    startTime: string;

    @Column({ name: 'end_time', type: 'time', nullable: true })
    endTime: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
