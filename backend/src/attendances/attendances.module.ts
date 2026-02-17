import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendancesService } from './attendances.service';
import { AttendancesController } from './attendances.controller';
import { Attendance } from './entities/attendance.entity';
import { Application } from './entities/application.entity';
import { StockModule } from '../stock/stock.module';
import { Vaccine } from '../vaccines/entities/vaccine.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Attendance, Application, Vaccine]),
        StockModule,
    ],
    controllers: [AttendancesController],
    providers: [AttendancesService],
    exports: [AttendancesService],
})
export class AttendancesModule { }
