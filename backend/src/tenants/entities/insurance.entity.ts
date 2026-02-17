import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('insurances')
export class Insurance {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @Column()
    name: string;

    @Column({ name: 'ans_code', nullable: true })
    ansCode: string;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'discount_percent' })
    discountPercent: number;

    @Column({ default: true })
    active: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
