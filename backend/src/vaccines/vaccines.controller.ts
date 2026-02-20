import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VaccinesService } from './vaccines.service';

@Controller('vaccines')
@UseGuards(AuthGuard('jwt'))
export class VaccinesController {
    constructor(private readonly vaccinesService: VaccinesService) { }

    @Post()
    createVaccine(@Request() req: any, @Body() dto: any) {
        return this.vaccinesService.createVaccine(req.user.tenantIds?.[0], dto);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.vaccinesService.findAllVaccines(req.user.tenantIds?.[0]);
    }

    @Post('batches')
    createBatch(@Request() req: any, @Body() dto: any) {
        return this.vaccinesService.createBatch(req.user.tenantIds?.[0], dto);
    }

    @Get(':vaccineId/batches')
    findBatches(@Request() req: any, @Param('vaccineId') vaccineId: string) {
        return this.vaccinesService.findBatchesByVaccine(req.user.tenantIds?.[0], vaccineId);
    }

    @Get('alerts/low-stock')
    getLowStock(@Request() req: any) {
        return this.vaccinesService.getLowStockVaccines(req.user.tenantIds?.[0]);
    }

    @Get('batches/expiring')
    getExpiring(@Request() req: any, @Query('days') days = '30') {
        return this.vaccinesService.getExpiringBatches(req.user.tenantIds?.[0], parseInt(days));
    }

    @Put(':id')
    update(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
        return this.vaccinesService.updateVaccine(req.user.tenantIds?.[0], id, dto);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.vaccinesService.deleteVaccine(req.user.tenantIds?.[0], id);
    }
}
