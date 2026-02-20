import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
} from 'typeorm';

export enum MessageChannel {
    WHATSAPP = 'whatsapp',
    SMS = 'sms',
    EMAIL = 'email',
}

export enum MessageStatus {
    PENDING = 'PENDING',
    SENT = 'SENT',
    FAILED = 'FAILED',
}

@Entity('message_logs')
export class MessageLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @Column({ type: 'enum', enum: MessageChannel })
    channel: MessageChannel;

    @Column({ name: 'recipient' })
    recipient: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'enum', enum: MessageStatus, default: MessageStatus.PENDING })
    status: MessageStatus;

    @Column({ name: 'external_id', nullable: true })
    externalId: string;

    @Column({ type: 'text', nullable: true })
    error: string;

    @Column({ name: 'entity_type', nullable: true })
    entityType: string;

    @Column({ name: 'entity_id', nullable: true })
    entityId: string;

    @Column({ name: 'sent_at', type: 'datetime', nullable: true })
    sentAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
