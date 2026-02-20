import { Controller, Get, Post, Param, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageLog, MessageStatus } from './entities/message-log.entity';
import { MessagingService } from './messaging.service';

@Controller('message-logs')
@UseGuards(AuthGuard('jwt'))
export class MessageLogsController {
    constructor(
        @InjectRepository(MessageLog)
        private logsRepo: Repository<MessageLog>,
        private readonly messagingService: MessagingService,
    ) { }

    @Get()
    async findAll(
        @Request() req: any,
        @Query('channel') channel?: string,
        @Query('status') status?: string,
        @Query('limit') limit = '100',
    ) {
        const tenantId = req.user.tenantIds?.[0];
        const where: any = { tenantId };
        if (channel) where.channel = channel;
        if (status) where.status = status;

        return this.logsRepo.find({
            where,
            order: { createdAt: 'DESC' },
            take: parseInt(limit),
        });
    }

    @Post(':id/retry')
    async retry(@Request() req: any, @Param('id') id: string) {
        const tenantId = req.user.tenantIds?.[0];
        const log = await this.logsRepo.findOne({ where: { id, tenantId } });
        if (!log) return { error: 'Log não encontrado' };

        const result = await this.messagingService.send(log.channel as any, log.recipient, log.content);
        const msgResult = result as any;

        log.status = result.success ? MessageStatus.SENT : MessageStatus.FAILED;
        log.externalId = msgResult.messageId ?? log.externalId;
        log.error = result.error ?? log.error;
        if (result.success) log.sentAt = new Date();
        await this.logsRepo.save(log);

        return { success: result.success, log };
    }
}
