import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
} from 'typeorm';

export enum PlanTier {
    FREE = 'FREE',
    PRO = 'PRO',
    ENTERPRISE = 'ENTERPRISE',
}

export enum SubscriptionStatus {
    TRIAL = 'TRIAL',
    ACTIVE = 'ACTIVE',
    PAST_DUE = 'PAST_DUE',
    CANCELLED = 'CANCELLED',
}

@Entity('subscriptions')
export class Subscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', unique: true })
    tenantId: string;

    @Column({ type: 'enum', enum: PlanTier, default: PlanTier.FREE })
    plan: PlanTier;

    @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.TRIAL })
    status: SubscriptionStatus;

    @Column({ name: 'max_patients', type: 'int', default: 50 })
    maxPatients: number;

    @Column({ name: 'max_units', type: 'int', default: 1 })
    maxUnits: number;

    @Column({ name: 'max_professionals', type: 'int', default: 3 })
    maxProfessionals: number;

    @Column({ name: 'monthly_price', type: 'decimal', precision: 10, scale: 2, default: 0 })
    monthlyPrice: number;

    @Column({ name: 'trial_ends_at', type: 'datetime', nullable: true })
    trialEndsAt: Date;

    @Column({ name: 'current_period_end', type: 'datetime', nullable: true })
    currentPeriodEnd: Date;

    @Column({ name: 'external_subscription_id', nullable: true })
    externalSubscriptionId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
