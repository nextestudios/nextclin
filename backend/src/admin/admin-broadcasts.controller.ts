import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SuperAdminGuard } from './admin.guard';

interface BroadcastRecord { id: string; channel: string; message: string; sentAt: Date; totalRecipients: number; successCount: number; }
const broadcastHistory: BroadcastRecord[] = [];

@Controller('admin/broadcasts')
@UseGuards(SuperAdminGuard)
export class AdminBroadcastsController {

    /** Send message to ALL active tenants */
    @Post()
    async sendBroadcast(@Body() dto: { channel: 'whatsapp' | 'email' | 'both'; message: string; subject?: string }) {
        // In production: query all tenants → get their admin contacts → enqueue via MessagingService
        const record: BroadcastRecord = {
            id: `broadcast-${Date.now()}`,
            channel: dto.channel,
            message: dto.message,
            sentAt: new Date(),
            totalRecipients: 0, // Will be filled by actual send logic
            successCount: 0,
        };

        broadcastHistory.unshift(record);
        return {
            success: true,
            broadcastId: record.id,
            message: `Broadcast agendado via ${dto.channel}. Os destinatários serão notificados em breve.`,
        };
    }

    @Get()
    getBroadcastHistory() {
        return broadcastHistory;
    }
}
