import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
} from 'typeorm';

@Entity('home_visit_checklists')
export class HomeVisitChecklist {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @Column({ name: 'appointment_id' })
    appointmentId: string;

    @Column({ name: 'professional_id' })
    professionalId: string;

    @Column({ name: 'thermal_box', default: false })
    thermalBox: boolean;

    @Column({ name: 'epi_kit', default: false })
    epiKit: boolean;

    @Column({ name: 'conservation_term', default: false })
    conservationTerm: boolean;

    @Column({ name: 'syringes_needles', default: false })
    syringesNeedles: boolean;

    @Column({ name: 'cotton_alcohol', default: false })
    cottonAlcohol: boolean;

    @Column({ name: 'waste_bag', default: false })
    wasteBag: boolean;

    @Column({ name: 'consent_form', default: false })
    consentForm: boolean;

    @Column({ name: 'vaccines_loaded', default: false })
    vaccinesLoaded: boolean;

    @Column({ name: 'all_checked', default: false })
    allChecked: boolean;

    @Column({ name: 'checked_by', nullable: true })
    checkedBy: string;

    @Column({ name: 'checked_at', type: 'datetime', nullable: true })
    checkedAt: Date;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
