import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';

@Controller('patients')
@UseGuards(AuthGuard('jwt'))
export class PatientsController {
    constructor(private readonly patientsService: PatientsService) { }

    @Post()
    create(@Request() req: any, @Body() dto: CreatePatientDto) {
        const tenantId = req.user.tenantIds?.[0]; // TODO: get from header/selection
        return this.patientsService.create(tenantId, dto);
    }

    @Get()
    findAll(@Request() req: any, @Query('search') search?: string) {
        const tenantId = req.user.tenantIds?.[0];
        return this.patientsService.findAll(tenantId, search);
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        const tenantId = req.user.tenantIds?.[0];
        return this.patientsService.findOne(tenantId, id);
    }

    @Put(':id')
    update(@Request() req: any, @Param('id') id: string, @Body() dto: Partial<CreatePatientDto>) {
        const tenantId = req.user.tenantIds?.[0];
        return this.patientsService.update(tenantId, id, dto);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        const tenantId = req.user.tenantIds?.[0];
        return this.patientsService.remove(tenantId, id);
    }
}
