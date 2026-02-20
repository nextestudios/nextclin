import { Controller, Get, Post, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { ScheduleBlocksService } from './schedule-blocks.service';

@Controller('schedule-blocks')
export class ScheduleBlocksController {
    constructor(private readonly blocksService: ScheduleBlocksService) { }

    @Post()
    create(@Request() req: any, @Body() dto: any) {
        return this.blocksService.create(req.user.tenantIds?.[0], dto);
    }

    @Get()
    findAll(
        @Request() req: any,
        @Query('professionalId') professionalId?: string,
        @Query('unitId') unitId?: string,
    ) {
        return this.blocksService.findAll(req.user.tenantIds?.[0], { professionalId, unitId });
    }

    @Delete(':id')
    delete(@Request() req: any, @Param('id') id: string) {
        return this.blocksService.delete(req.user.tenantIds?.[0], id);
    }
}
