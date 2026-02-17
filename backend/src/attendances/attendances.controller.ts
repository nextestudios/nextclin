import { Controller, Get, Post, Put, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AttendancesService } from './attendances.service';
import { AttendanceStatus } from './entities/attendance.entity';

@Controller('attendances')
@UseGuards(AuthGuard('jwt'))
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

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.attendancesService.findOne(req.user.tenantIds?.[0], id);
    }

    @Put(':id/status')
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
