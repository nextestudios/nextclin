import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
    UpdateDateColumn, OneToMany,
} from 'typeorm';
import { Batch } from './batch.entity';

@Entity('vaccines')
export class Vaccine {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    manufacturer: string;

    @Column({ name: 'dose_interval_days', type: 'int', default: 0 })
    doseIntervalDays: number;

    @Column({ name: 'total_doses', type: 'int', default: 1 })
    totalDoses: number;

    @Column({ name: 'cost_price', type: 'decimal', precision: 10, scale: 2, default: 0 })
    costPrice: number;

    @Column({ name: 'sale_price', type: 'decimal', precision: 10, scale: 2, default: 0 })
    salePrice: number;

    @Column({ default: true })
    active: boolean;

    @OneToMany(() => Batch, (b) => b.vaccine)
    batches: Batch[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
