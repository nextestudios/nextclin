import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentsService } from './appointments.service';
import { AppointmentStatus } from './entities/appointment.entity';

@Controller('appointments')
@UseGuards(AuthGuard('jwt'))
export class AppointmentsController {
    constructor(private readonly appointmentsService: AppointmentsService) { }

    @Post()
    create(@Request() req: any, @Body() dto: any) {
        const tenantId = req.user.tenantIds?.[0];
        return this.appointmentsService.create(tenantId, dto);
    }

    @Get()
    findAll(
        @Request() req: any,
        @Query('date') date?: string,
        @Query('professionalId') professionalId?: string,
        @Query('status') status?: string,
    ) {
        const tenantId = req.user.tenantIds?.[0];
        return this.appointmentsService.findAll(tenantId, { date, professionalId, status });
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        const tenantId = req.user.tenantIds?.[0];
        return this.appointmentsService.findOne(tenantId, id);
    }

    @Put(':id/status')
    updateStatus(
        @Request() req: any,
        @Param('id') id: string,
        @Body('status') status: AppointmentStatus,
    ) {
        const tenantId = req.user.tenantIds?.[0];
        return this.appointmentsService.updateStatus(tenantId, id, status);
    }

    @Delete(':id')
    cancel(@Request() req: any, @Param('id') id: string) {
        const tenantId = req.user.tenantIds?.[0];
        return this.appointmentsService.cancel(tenantId, id);
    }
}
