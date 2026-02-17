import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('audit_log')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column()
    action: string;

    @Column({ name: 'entity_type' })
    entityType: string;

    @Column({ name: 'entity_id' })
    entityId: string;

    @Column({ type: 'json', nullable: true })
    oldValues: any;

    @Column({ type: 'json', nullable: true })
    newValues: any;

    @Column({ name: 'ip_address', nullable: true })
    ipAddress: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
