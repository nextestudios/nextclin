import { Controller, Get, Post, Patch, Body, Param, Request } from '@nestjs/common';
import { HomeVisitChecklistService } from './home-visit-checklist.service';

@Controller('home-visit-checklists')
export class HomeVisitChecklistController {
    constructor(private readonly checklistService: HomeVisitChecklistService) { }

    @Post()
    create(@Request() req: any, @Body() dto: any) {
        return this.checklistService.create(req.user.tenantIds?.[0], dto);
    }

    @Get('appointment/:appointmentId')
    findByAppointment(@Request() req: any, @Param('appointmentId') appointmentId: string) {
        return this.checklistService.findByAppointment(req.user.tenantIds?.[0], appointmentId);
    }

    @Patch(':id')
    update(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
        return this.checklistService.update(req.user.tenantIds?.[0], id, dto);
    }

    @Patch(':id/mark-all')
    markAllChecked(@Request() req: any, @Param('id') id: string) {
        return this.checklistService.markAllChecked(req.user.tenantIds?.[0], id, req.user.sub);
    }

    @Patch(':id/toggle')
    toggleItem(@Request() req: any, @Param('id') id: string, @Body() body: { field: string; value: boolean }) {
        return this.checklistService.toggleItem(req.user.tenantIds?.[0], id, body.field, body.value);
    }
}
