import { Controller, Get, Post, Body, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StockService } from './stock.service';
import { MovementReason } from './entities/stock-movement.entity';

@Controller('stock')
@UseGuards(AuthGuard('jwt'))
export class StockController {
    constructor(private readonly stockService: StockService) { }

    @Post('entry')
    addEntry(@Request() req: any, @Body() body: any) {
        return this.stockService.addEntry(
            req.user.tenantIds?.[0], body.batchId, body.quantity,
            body.reason || MovementReason.PURCHASE, req.user.userId, body.notes,
        );
    }

    @Post('exit')
    addExit(@Request() req: any, @Body() body: any) {
        return this.stockService.addExit(
            req.user.tenantIds?.[0], body.batchId, body.quantity,
            body.reason || MovementReason.APPLICATION, req.user.userId, body.notes,
        );
    }

    @Get('movements')
    getMovements(@Request() req: any, @Query('batchId') batchId?: string) {
        return this.stockService.getMovements(req.user.tenantIds?.[0], batchId);
    }
}
