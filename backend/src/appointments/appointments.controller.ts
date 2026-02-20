import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentStatus } from './entities/appointment.entity';

@Controller('appointments')
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

    @Get('upcoming')
    getUpcoming(@Request() req: any) {
        const tenantId = req.user.tenantIds?.[0];
        // Get next 7 days of appointments
        const today = new Date().toISOString().split('T')[0];
        const weekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return this.appointmentsService.findAll(tenantId, { dateFrom: today, dateTo: weekLater });
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        const tenantId = req.user.tenantIds?.[0];
        return this.appointmentsService.findOne(tenantId, id);
    }

    @Patch(':id/status')
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
