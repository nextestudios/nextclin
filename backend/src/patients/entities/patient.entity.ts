import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
    UpdateDateColumn, DeleteDateColumn, Index, OneToMany,
} from 'typeorm';
import { Attendance } from '../../attendances/entities/attendance.entity';

@Entity('patients')
@Index(['tenantId', 'cpf'], { unique: true, where: '"cpf" IS NOT NULL' })
@Index(['tenantId', 'createdAt'])
export class Patient {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @Column({ name: 'prontuario', unique: true })
    prontuario: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    cpf: string;

    @Column({ name: 'birth_date', type: 'date', nullable: true })
    birthDate: Date;

    @Column({ nullable: true })
    gender: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    state: string;

    @Column({ name: 'zip_code', nullable: true })
    zipCode: string;

    @Column({ name: 'guardian_name', nullable: true })
    guardianName: string;

    @Column({ name: 'guardian_cpf', nullable: true })
    guardianCpf: string;

    @Column({ name: 'guardian_phone', nullable: true })
    guardianPhone: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @OneToMany(() => Attendance, (a) => a.patient)
    attendances: Attendance[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;
}
