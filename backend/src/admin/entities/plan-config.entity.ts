import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { PlanTier } from '../../tenants/entities/subscription.entity';

@Entity('plan_configs')
export class PlanConfig {
    @PrimaryColumn({ type: 'enum', enum: PlanTier })
    plan: PlanTier;

    @Column()
    name: string;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    price: number;

    @Column({ name: 'max_units', type: 'int', nullable: true })
    maxUnits: number | null;

    @Column({ name: 'max_professionals', type: 'int', nullable: true })
    maxProfessionals: number | null;

    @Column({ name: 'max_patients', type: 'int', nullable: true })
    maxPatients: number | null;

    @Column('simple-array')
    features: string[];

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
