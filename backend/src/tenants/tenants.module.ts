import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { Tenant } from './entities/tenant.entity';
import { Professional } from './entities/professional.entity';
import { Insurance } from './entities/insurance.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Tenant, Professional, Insurance])],
    controllers: [TenantsController],
    providers: [TenantsService],
    exports: [TenantsService],
})
export class TenantsModule { }
