import { Controller, Get, Post, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as crypto from 'crypto';

/**
 * Payment Gateway Controller
 * Integrates with Asaas (or similar) for PIX payments.
 * Falls back to mock mode when PAYMENT_API_KEY is not configured.
 */
@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
    private readonly apiUrl = process.env.PAYMENT_API_URL || 'https://sandbox.asaas.com/api/v3';
    private readonly apiKey = process.env.PAYMENT_API_KEY;

    /** Generate PIX QR Code for an account receivable */
    @Post('pix/generate')
    async generatePix(@Request() req: any, @Body() dto: { receivableId: string; amount: number; description: string; customerName: string; customerCpf: string }) {
        if (this.apiKey) {
            try {
                // Create customer
                const customerRes = await fetch(`${this.apiUrl}/customers`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'access_token': this.apiKey },
                    body: JSON.stringify({ name: dto.customerName, cpfCnpj: dto.customerCpf }),
                });
                const customer = await customerRes.json() as any;

                // Create PIX payment
                const paymentRes = await fetch(`${this.apiUrl}/payments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'access_token': this.apiKey },
                    body: JSON.stringify({
                        customer: customer.id,
                        billingType: 'PIX',
                        value: dto.amount,
                        dueDate: new Date().toISOString().split('T')[0],
                        description: dto.description,
                        externalReference: dto.receivableId,
                    }),
                });
                const payment = await paymentRes.json() as any;

                // Get PIX QR Code
                const qrRes = await fetch(`${this.apiUrl}/payments/${payment.id}/pixQrCode`, {
                    headers: { 'access_token': this.apiKey },
                });
                const qrCode = await qrRes.json() as any;

                return {
                    success: true,
                    paymentId: payment.id,
                    pixCode: qrCode.payload,
                    qrCodeImage: qrCode.encodedImage,
                    expirationDate: qrCode.expirationDate,
                };
            } catch (err: any) {
                return { success: false, error: err.message };
            }
        }

        // Mock mode
        const mockPixCode = `00020126580014br.gov.bcb.pix0136${crypto.randomUUID()}5204000053039865406${dto.amount.toFixed(2)}5802BR59${dto.customerName.substring(0, 25)}6008Sao Paulo62070503***6304`;
        return {
            success: true,
            paymentId: `mock-${Date.now()}`,
            pixCode: mockPixCode,
            qrCodeImage: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mockPixCode)}`,
            expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            mock: true,
        };
    }

    /** Webhook to receive payment confirmations (public endpoint) */
    @Post('webhook')
    async webhook(@Body() payload: any) {
        // In production: validate webhook signature
        if (payload.event === 'PAYMENT_RECEIVED') {
            const paymentId = payload.payment?.id;
            const externalRef = payload.payment?.externalReference;
            // TODO: Mark AccountReceivable as PAID based on externalRef
            return { received: true, paymentId, externalRef };
        }
        return { received: true };
    }

    /** Check payment status */
    @Get(':paymentId/status')
    async checkStatus(@Param('paymentId') paymentId: string) {
        if (this.apiKey) {
            try {
                const res = await fetch(`${this.apiUrl}/payments/${paymentId}`, {
                    headers: { 'access_token': this.apiKey },
                });
                const payment = await res.json() as any;
                return { status: payment.status, paymentId, paidAt: payment.confirmedDate };
            } catch (err: any) {
                return { error: err.message };
            }
        }
        return { status: 'MOCK_PENDING', paymentId, mock: true };
    }

    /** List available payment methods */
    @Get('methods')
    getMethods() {
        return [
            { id: 'PIX', name: 'PIX', icon: '🔑', instant: true, fee: 0 },
            { id: 'CREDIT_CARD', name: 'Cartão de Crédito', icon: '💳', instant: true, fee: 2.99 },
            { id: 'DEBIT_CARD', name: 'Cartão de Débito', icon: '💳', instant: true, fee: 1.49 },
            { id: 'BANK_SLIP', name: 'Boleto Bancário', icon: '📄', instant: false, fee: 1.99 },
            { id: 'CASH', name: 'Dinheiro', icon: '💵', instant: true, fee: 0 },
        ];
    }
}
