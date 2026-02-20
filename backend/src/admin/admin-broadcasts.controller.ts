import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SuperAdminGuard } from './admin.guard';

interface BroadcastRecord {
    id: string;
    channel: string;
    message: string;
    sentAt: Date;
    totalRecipients: number;
    successCount: number;
    filters?: { plan?: string; status?: string };
}
const broadcastHistory: BroadcastRecord[] = [];

@Controller('admin/broadcasts')
@UseGuards(SuperAdminGuard)
export class AdminBroadcastsController {

    /** Send message to ALL active tenants or filtered target */
    @Post()
    async sendBroadcast(@Body() dto: { channel: 'whatsapp' | 'email' | 'both'; message: string; subject?: string; filters?: { plan?: string; status?: string } }) {
        // In production: query all tenants → get their admin contacts → enqueue via MessagingService

        // Mock filtering logic representation
        const record: BroadcastRecord = {
            id: `broadcast-${Date.now()}`,
            channel: dto.channel,
            message: dto.message,
            sentAt: new Date(),
            totalRecipients: 0, // Will be filled by actual send logic based on filters
            successCount: 0,
            filters: dto.filters,
        };

        broadcastHistory.unshift(record);
        return {
            success: true,
            broadcastId: record.id,
            message: `Broadcast agendado via ${dto.channel}. Os destinatários serão notificados em breve baseados nos filtros selecionados.`,
        };
    }

    @Get()
    getBroadcastHistory() {
        return broadcastHistory;
    }
}
