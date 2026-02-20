import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeVisitChecklist } from './entities/home-visit-checklist.entity';

@Injectable()
export class HomeVisitChecklistService {
    constructor(
        @InjectRepository(HomeVisitChecklist)
        private checklistRepo: Repository<HomeVisitChecklist>,
    ) { }

    async create(tenantId: string, dto: any): Promise<HomeVisitChecklist> {
        const checklist = this.checklistRepo.create({ ...dto, tenantId });
        const saved = await this.checklistRepo.save(checklist);
        return Array.isArray(saved) ? saved[0] : saved;
    }

    async findByAppointment(tenantId: string, appointmentId: string): Promise<HomeVisitChecklist | null> {
        return this.checklistRepo.findOne({ where: { tenantId, appointmentId } });
    }

    async update(tenantId: string, id: string, dto: any): Promise<HomeVisitChecklist> {
        await this.checklistRepo.update({ id, tenantId }, dto);
        return this.checklistRepo.findOneOrFail({ where: { id, tenantId } });
    }

    async markAllChecked(tenantId: string, id: string, userId: string): Promise<HomeVisitChecklist> {
        await this.checklistRepo.update({ id, tenantId }, {
            thermalBox: true,
            epiKit: true,
            conservationTerm: true,
            syringesNeedles: true,
            cottonAlcohol: true,
            wasteBag: true,
            consentForm: true,
            vaccinesLoaded: true,
            allChecked: true,
            checkedBy: userId,
            checkedAt: new Date(),
        });
        return this.checklistRepo.findOneOrFail({ where: { id, tenantId } });
    }

    async toggleItem(tenantId: string, id: string, field: string, value: boolean): Promise<HomeVisitChecklist> {
        const allowedFields = [
            'thermalBox', 'epiKit', 'conservationTerm', 'syringesNeedles',
            'cottonAlcohol', 'wasteBag', 'consentForm', 'vaccinesLoaded',
        ];
        if (!allowedFields.includes(field)) throw new Error('Campo inválido');

        const update: any = { [field]: value };

        // Check if all items are checked
        const checklist = await this.checklistRepo.findOneOrFail({ where: { id, tenantId } });
        const merged = { ...checklist, ...update };
        update.allChecked = allowedFields.every(f => (merged as any)[f] === true);
        if (update.allChecked) {
            update.checkedAt = new Date();
        }

        await this.checklistRepo.update({ id, tenantId }, update);
        return this.checklistRepo.findOneOrFail({ where: { id, tenantId } });
    }
}
