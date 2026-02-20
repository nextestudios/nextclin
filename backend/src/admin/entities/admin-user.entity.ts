import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AdminRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
}

@Entity('admin_users')
export class AdminUser {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 120 })
    name: string;

    @Column({ unique: true, length: 200 })
    email: string;

    @Column()
    password: string;

    @Column({ type: 'enum', enum: AdminRole, default: AdminRole.ADMIN })
    role: AdminRole;

    @Column({ default: true })
    active: boolean;

    @Column({ nullable: true })
    lastLoginAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
