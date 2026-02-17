import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
    UpdateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Vaccine } from './vaccine.entity';

@Entity('batches')
@Index(['tenantId', 'lotNumber'])
export class Batch {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @Column({ name: 'vaccine_id' })
    vaccineId: string;

    @ManyToOne(() => Vaccine, (v) => v.batches)
    @JoinColumn({ name: 'vaccine_id' })
    vaccine: Vaccine;

    @Column({ name: 'lot_number' })
    lotNumber: string;

    @Column({ name: 'expiry_date', type: 'date' })
    expiryDate: Date;

    @Column({ name: 'quantity_available', type: 'int', default: 0 })
    quantityAvailable: number;

    @Column({ name: 'unit_id', nullable: true })
    unitId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
