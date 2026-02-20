import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { ProfessionalsService } from './professionals.service';
import { ProfessionalsController } from './professionals.controller';
import { InsurancesService } from './insurances.service';
import { InsurancesController } from './insurances.controller';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';
import { Tenant } from './entities/tenant.entity';
import { Professional } from './entities/professional.entity';
import { Insurance } from './entities/insurance.entity';
import { Unit } from './entities/unit.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Tenant, Professional, Insurance, Unit])],
    controllers: [TenantsController, ProfessionalsController, InsurancesController, UnitsController],
    providers: [TenantsService, ProfessionalsService, InsurancesService, UnitsService],
    exports: [TenantsService, ProfessionalsService, InsurancesService, UnitsService],
})
export class TenantsModule { }
