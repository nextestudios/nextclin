import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { ProfessionalsService } from './professionals.service';
import { ProfessionalsController } from './professionals.controller';
import { InsurancesService } from './insurances.service';
import { InsurancesController } from './insurances.controller';
import { Tenant } from './entities/tenant.entity';
import { Professional } from './entities/professional.entity';
import { Insurance } from './entities/insurance.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Tenant, Professional, Insurance])],
    controllers: [TenantsController, ProfessionalsController, InsurancesController],
    providers: [TenantsService, ProfessionalsService, InsurancesService],
    exports: [TenantsService, ProfessionalsService, InsurancesService],
})
export class TenantsModule { }
