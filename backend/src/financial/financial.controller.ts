import { Controller, Get, Post, Put, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FinancialService } from './financial.service';

@Controller('financial')
@UseGuards(AuthGuard('jwt'))
export class FinancialController {
    constructor(private readonly financialService: FinancialService) { }

    // --- Accounts Receivable ---
    @Post('receivables')
    createReceivable(@Request() req: any, @Body() dto: any) {
        return this.financialService.createReceivable(req.user.tenantIds?.[0], dto);
    }

    @Get('receivables')
    findAllReceivables(@Request() req: any, @Query('status') status?: string) {
        return this.financialService.findAllReceivables(req.user.tenantIds?.[0], status);
    }

    @Put('receivables/:id/pay')
    markAsPaid(@Request() req: any, @Param('id') id: string) {
        return this.financialService.markAsPaid(req.user.tenantIds?.[0], id);
    }

    @Get('receivables/overdue')
    getOverdue(@Request() req: any) {
        return this.financialService.getOverdueReceivables(req.user.tenantIds?.[0]);
    }

    // --- Accounts Payable ---
    @Post('payables')
    createPayable(@Request() req: any, @Body() dto: any) {
        return this.financialService.createPayable(req.user.tenantIds?.[0], dto);
    }

    @Get('payables')
    findAllPayables(@Request() req: any, @Query('status') status?: string) {
        return this.financialService.findAllPayables(req.user.tenantIds?.[0], status);
    }

    @Put('payables/:id/pay')
    markPayableAsPaid(@Request() req: any, @Param('id') id: string) {
        return this.financialService.markPayableAsPaid(req.user.tenantIds?.[0], id);
    }

    // --- Dashboard ---
    @Get('dashboard')
    getDashboard(@Request() req: any) {
        return this.financialService.getDashboardStats(req.user.tenantIds?.[0]);
    }
}
