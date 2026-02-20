import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
} from 'typeorm';

@Entity('patient_consents')
export class PatientConsent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @Column({ name: 'patient_id' })
    patientId: string;

    @Column({ name: 'consent_type' })
    consentType: string; // LGPD_DATA_PROCESSING, VACCINATION_AUTHORIZATION, HOME_VISIT

    @Column({ type: 'text' })
    description: string;

    @Column({ default: false })
    accepted: boolean;

    @Column({ name: 'accepted_at', type: 'datetime', nullable: true })
    acceptedAt: Date;

    @Column({ name: 'ip_address', nullable: true })
    ipAddress: string;

    @Column({ name: 'revoked_at', type: 'datetime', nullable: true })
    revokedAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
