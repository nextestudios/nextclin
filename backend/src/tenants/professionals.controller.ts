import { Controller, Get, Post, Put, Delete, Body, Param, Request } from '@nestjs/common';
import { ProfessionalsService } from './professionals.service';

@Controller('professionals')
export class ProfessionalsController {
    constructor(private readonly professionalsService: ProfessionalsService) { }

    @Post()
    create(@Request() req: any, @Body() dto: any) {
        const tenantId = req.tenantId || req.user?.tenantIds?.[0];
        return this.professionalsService.create(tenantId, dto);
    }

    @Get()
    findAll(@Request() req: any) {
        const tenantId = req.tenantId || req.user?.tenantIds?.[0];
        return this.professionalsService.findAll(tenantId);
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        const tenantId = req.tenantId || req.user?.tenantIds?.[0];
        return this.professionalsService.findOne(tenantId, id);
    }

    @Put(':id')
    update(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
        const tenantId = req.tenantId || req.user?.tenantIds?.[0];
        return this.professionalsService.update(tenantId, id, dto);
    }

    @Delete(':id')
    deactivate(@Request() req: any, @Param('id') id: string) {
        const tenantId = req.tenantId || req.user?.tenantIds?.[0];
        return this.professionalsService.deactivate(tenantId, id);
    }
}
