import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { ScheduleBlocksService } from './schedule-blocks.service';
import { ScheduleBlocksController } from './schedule-blocks.controller';
import { Appointment } from './entities/appointment.entity';
import { ScheduleBlock } from './entities/schedule-block.entity';
import { HomeVisitChecklist } from './entities/home-visit-checklist.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Appointment, ScheduleBlock, HomeVisitChecklist])],
    controllers: [AppointmentsController, ScheduleBlocksController],
    providers: [AppointmentsService, ScheduleBlocksService],
    exports: [AppointmentsService, ScheduleBlocksService],
})
export class AppointmentsModule { }
