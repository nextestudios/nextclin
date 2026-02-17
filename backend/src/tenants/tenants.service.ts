import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';

@Injectable()
export class TenantsService {
    constructor(
        @InjectRepository(Tenant)
        private tenantsRepository: Repository<Tenant>,
    ) { }

    findAll() {
        return this.tenantsRepository.find();
    }

    findOne(id: string) {
        return this.tenantsRepository.findOne({ where: { id } });
    }

    create(data: Partial<Tenant>) {
        const tenant = this.tenantsRepository.create(data);
        return this.tenantsRepository.save(tenant);
    }
}
