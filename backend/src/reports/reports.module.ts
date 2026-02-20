import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Application } from '../attendances/entities/application.entity';
import { AccountReceivable } from '../financial/entities/account-receivable.entity';
import { Batch } from '../vaccines/entities/batch.entity';
import { Vaccine } from '../vaccines/entities/vaccine.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Application, AccountReceivable, Batch, Vaccine])],
    controllers: [ReportsController],
    providers: [ReportsService],
})
export class ReportsModule { }
