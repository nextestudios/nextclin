import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
} from 'typeorm';

@Entity('user_mfa')
export class UserMfa {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', unique: true })
    userId: string;

    @Column({ name: 'secret', nullable: true })
    secret: string;

    @Column({ name: 'enabled', default: false })
    enabled: boolean;

    @Column({ name: 'recovery_codes', type: 'json', nullable: true })
    recoveryCodes: string[];

    @Column({ name: 'verified_at', type: 'datetime', nullable: true })
    verifiedAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
