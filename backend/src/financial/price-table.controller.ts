import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceTable } from './entities/price-table.entity';

@Controller('price-tables')
@UseGuards(AuthGuard('jwt'))
export class PriceTableController {
    constructor(
        @InjectRepository(PriceTable)
        private priceTableRepo: Repository<PriceTable>,
    ) { }

    @Get()
    findAll(@Request() req: any, @Query('vaccineId') vaccineId?: string, @Query('insuranceId') insuranceId?: string) {
        const where: any = { tenantId: req.user.tenantIds?.[0], active: true };
        if (vaccineId) where.vaccineId = vaccineId;
        if (insuranceId) where.insuranceId = insuranceId;
        return this.priceTableRepo.find({ where, order: { createdAt: 'DESC' } });
    }

    @Post()
    create(@Request() req: any, @Body() dto: any) {
        const entry = this.priceTableRepo.create({
            ...dto,
            tenantId: req.user.tenantIds?.[0],
        });
        return this.priceTableRepo.save(entry);
    }

    @Put(':id')
    async update(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
        const tenantId = req.user.tenantIds?.[0];
        await this.priceTableRepo.update({ id, tenantId }, dto);
        return this.priceTableRepo.findOne({ where: { id, tenantId } });
    }

    @Delete(':id')
    async remove(@Request() req: any, @Param('id') id: string) {
        const tenantId = req.user.tenantIds?.[0];
        await this.priceTableRepo.update({ id, tenantId }, { active: false });
        return { success: true };
    }

    // Get best price for a vaccine + insurance combination
    @Get('lookup')
    async lookup(
        @Request() req: any,
        @Query('vaccineId') vaccineId: string,
        @Query('insuranceId') insuranceId?: string,
    ) {
        const tenantId = req.user.tenantIds?.[0];
        const where: any = { tenantId, vaccineId, active: true };
        if (insuranceId) where.insuranceId = insuranceId;

        const prices = await this.priceTableRepo.find({ where, order: { price: 'ASC' } });
        return prices[0] || null;
    }
}
