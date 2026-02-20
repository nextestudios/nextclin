import { Controller, Get, Post, Patch, Body, Param, Query, Request } from '@nestjs/common';
import { AttendancesService } from './attendances.service';
import { AttendanceStatus } from './entities/attendance.entity';

@Controller('attendances')
export class AttendancesController {
    constructor(private readonly attendancesService: AttendancesService) { }

    @Post()
    create(@Request() req: any, @Body() dto: any) {
        return this.attendancesService.create(req.user.tenantIds?.[0], dto);
    }

    @Get('queue')
    findQueue(@Request() req: any, @Query('unitId') unitId?: string) {
        return this.attendancesService.findQueue(req.user.tenantIds?.[0], unitId);
    }

    @Get('stats/today')
    async getTodayStats(@Request() req: any) {
        return this.attendancesService.getTodayStats(req.user.tenantIds?.[0]);
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.attendancesService.findOne(req.user.tenantIds?.[0], id);
    }

    @Patch(':id/status')
    updateStatus(
        @Request() req: any,
        @Param('id') id: string,
        @Body('status') status: AttendanceStatus,
    ) {
        return this.attendancesService.updateStatus(req.user.tenantIds?.[0], id, status);
    }

    @Post(':id/apply')
    applyVaccine(
        @Request() req: any,
        @Param('id') id: string,
        @Body() dto: any,
    ) {
        return this.attendancesService.applyVaccine(
            req.user.tenantIds?.[0], id, dto, req.user.userId,
        );
    }
}
