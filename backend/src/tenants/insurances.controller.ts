import { Controller, Get, Post, Put, Delete, Body, Param, Request } from '@nestjs/common';
import { InsurancesService } from './insurances.service';

@Controller('insurances')
export class InsurancesController {
    constructor(private readonly insurancesService: InsurancesService) { }

    @Post()
    create(@Request() req: any, @Body() dto: any) {
        const tenantId = req.tenantId || req.user?.tenantIds?.[0];
        return this.insurancesService.create(tenantId, dto);
    }

    @Get()
    findAll(@Request() req: any) {
        const tenantId = req.tenantId || req.user?.tenantIds?.[0];
        return this.insurancesService.findAll(tenantId);
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        const tenantId = req.tenantId || req.user?.tenantIds?.[0];
        return this.insurancesService.findOne(tenantId, id);
    }

    @Put(':id')
    update(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
        const tenantId = req.tenantId || req.user?.tenantIds?.[0];
        return this.insurancesService.update(tenantId, id, dto);
    }

    @Delete(':id')
    deactivate(@Request() req: any, @Param('id') id: string) {
        const tenantId = req.tenantId || req.user?.tenantIds?.[0];
        return this.insurancesService.deactivate(tenantId, id);
    }
}
