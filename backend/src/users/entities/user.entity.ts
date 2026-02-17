import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

export enum UserRole {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    SUPERVISOR = 'SUPERVISOR',
    RECEPTIONIST = 'RECEPTIONIST',
    FINANCIAL = 'FINANCIAL',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    passwordHash: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.RECEPTIONIST,
    })
    role: UserRole;

    @ManyToMany(() => Tenant)
    @JoinTable({
        name: 'user_tenants',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'tenant_id', referencedColumnName: 'id' },
    })
    tenants: Tenant[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
