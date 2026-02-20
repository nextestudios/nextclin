import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
} from 'typeorm';

@Entity('price_tables')
export class PriceTable {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @Column({ name: 'vaccine_id' })
    vaccineId: string;

    @Column({ name: 'insurance_id', nullable: true })
    insuranceId: string;

    @Column({ name: 'unit_id', nullable: true })
    unitId: string;

    @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ name: 'discount_percent', type: 'decimal', precision: 5, scale: 2, default: 0 })
    discountPercent: number;

    @Column({ default: true })
    active: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
