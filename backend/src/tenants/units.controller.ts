import { Controller, Get, Post, Put, Delete, Body, Param, Request } from '@nestjs/common';
import { UnitsService } from './units.service';

@Controller('units')
export class UnitsController {
    constructor(private readonly unitsService: UnitsService) { }

    @Post()
    create(@Request() req: any, @Body() dto: any) {
        return this.unitsService.create(req.user.tenantIds?.[0], dto);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.unitsService.findAll(req.user.tenantIds?.[0]);
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.unitsService.findOne(req.user.tenantIds?.[0], id);
    }

    @Put(':id')
    update(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
        return this.unitsService.update(req.user.tenantIds?.[0], id, dto);
    }

    @Delete(':id')
    deactivate(@Request() req: any, @Param('id') id: string) {
        return this.unitsService.deactivate(req.user.tenantIds?.[0], id);
    }
}
