import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

/**
 * LandingPageConfig — key/value store para o CMS da Landing Page.
 * Sections: hero | features | pricing | cta | social_proof
 * Cada section tem múltiplas keys (ex: hero.title, hero.subtitle, hero.cta_text)
 */
@Entity('landing_page_config')
export class LandingPageConfig {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 50 })
    section: string;

    @Column({ length: 100 })
    key: string;

    @Column({ type: 'text' })
    value: string;

    @Column({ default: 'text', length: 20 })
    type: string; // 'text' | 'textarea' | 'json' | 'url'

    @UpdateDateColumn()
    updatedAt: Date;
}
