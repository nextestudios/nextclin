import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { ScheduleBlocksService } from './schedule-blocks.service';
import { ScheduleBlocksController } from './schedule-blocks.controller';
import { HomeVisitChecklistService } from './home-visit-checklist.service';
import { HomeVisitChecklistController } from './home-visit-checklist.controller';
import { HomeVisitRoutesController } from './home-visit-routes.controller';
import { GoogleCalendarService } from './google-calendar.service';
import { Appointment } from './entities/appointment.entity';
import { ScheduleBlock } from './entities/schedule-block.entity';
import { HomeVisitChecklist } from './entities/home-visit-checklist.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Appointment, ScheduleBlock, HomeVisitChecklist])],
    controllers: [AppointmentsController, ScheduleBlocksController, HomeVisitChecklistController, HomeVisitRoutesController],
    providers: [AppointmentsService, ScheduleBlocksService, HomeVisitChecklistService, GoogleCalendarService],
    exports: [AppointmentsService, ScheduleBlocksService, HomeVisitChecklistService, GoogleCalendarService],
})
export class AppointmentsModule { }
