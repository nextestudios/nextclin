import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { PatientConsentsController } from './patient-consents.controller';
import { PortalController } from './portal.controller';
import { Patient } from './entities/patient.entity';
import { PatientConsent } from './entities/patient-consent.entity';
import { Appointment } from '../appointments/entities/appointment.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Patient, PatientConsent, Appointment])],
    controllers: [PatientsController, PatientConsentsController, PortalController],
    providers: [PatientsService],
    exports: [PatientsService],
})
export class PatientsModule { }
