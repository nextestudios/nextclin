import { Controller, Get, Query, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('vaccines-applied')
    vaccinesApplied(
        @Request() req: any,
        @Query('dateFrom') dateFrom: string,
        @Query('dateTo') dateTo: string,
    ) {
        return this.reportsService.vaccinesApplied(req.user.tenantIds?.[0], dateFrom, dateTo);
    }

    @Get('overdue-receivables')
    overdueReceivables(@Request() req: any) {
        return this.reportsService.overdueReceivables(req.user.tenantIds?.[0]);
    }

    @Get('stock-summary')
    stockSummary(@Request() req: any) {
        return this.reportsService.stockSummary(req.user.tenantIds?.[0]);
    }

    @Get('commission')
    commissionReport(
        @Request() req: any,
        @Query('dateFrom') dateFrom: string,
        @Query('dateTo') dateTo: string,
    ) {
        return this.reportsService.commissionReport(req.user.tenantIds?.[0], dateFrom, dateTo);
    }

    @Get('low-stock')
    lowStock(@Request() req: any) {
        return this.reportsService.lowStockAlerts(req.user.tenantIds?.[0]);
    }
}
