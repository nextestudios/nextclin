import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageLog, MessageChannel, MessageStatus } from './entities/message-log.entity';

/**
 * Messaging Channel Interface — abstraction for WhatsApp, SMS, Email.
 */
export interface IMessagingChannel {
    send(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

/**
 * WhatsApp Channel — Evolution API integration with mock fallback.
 * Configure via env: EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE
 */
export class WhatsAppChannel implements IMessagingChannel {
    private readonly logger = new Logger('WhatsAppChannel');
    private readonly apiUrl = process.env.EVOLUTION_API_URL;
    private readonly apiKey = process.env.EVOLUTION_API_KEY;
    private readonly instance = process.env.EVOLUTION_INSTANCE || 'nextclin';

    async send(to: string, message: string) {
        const phone = to.replace(/\D/g, '');

        // Real mode: Evolution API
        if (this.apiUrl && this.apiKey) {
            try {
                const response = await fetch(`${this.apiUrl}/message/sendText/${this.instance}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': this.apiKey,
                    },
                    body: JSON.stringify({
                        number: `55${phone}`,
                        text: message,
                    }),
                });

                const data = await response.json() as any;
                if (response.ok) {
                    this.logger.log(`[WHATSAPP ✅] Enviado para ${phone}`);
                    return { success: true, messageId: data?.key?.id || `wa-${Date.now()}` };
                }
                this.logger.error(`[WHATSAPP ❌] Falha: ${JSON.stringify(data)}`);
                return { success: false, error: data?.message || 'Erro na Evolution API' };
            } catch (err: any) {
                this.logger.error(`[WHATSAPP ❌] Exception: ${err.message}`);
                return { success: false, error: err.message };
            }
        }

        // Mock mode: log only
        this.logger.warn(`[WHATSAPP MOCK] → ${phone}: ${message.substring(0, 50)}...`);
        return { success: true, messageId: `wa-mock-${Date.now()}-${phone}` };
    }
}

/**
 * SMS Channel (Mock) — replace with Twilio, Zenvia, etc.
 */
export class SmsChannel implements IMessagingChannel {
    private readonly logger = new Logger('SmsChannel');

    async send(to: string, message: string) {
        const phone = to.replace(/\D/g, '');
        this.logger.log(`[SMS] → ${phone}: ${message.substring(0, 160)}`);
        return { success: true, messageId: `sms-${Date.now()}-${phone}` };
    }
}

/**
 * Email Channel — Nodemailer/SMTP integration with mock fallback.
 * Configure via env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 */
export class EmailChannel implements IMessagingChannel {
    private readonly logger = new Logger('EmailChannel');
    private transporter: any = null;

    constructor() {
        const host = process.env.SMTP_HOST;
        const port = process.env.SMTP_PORT;
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        if (host && user && pass) {
            try {
                // Dynamic import to avoid hard dependency
                const nodemailer = require('nodemailer');
                this.transporter = nodemailer.createTransport({
                    host,
                    port: parseInt(port || '587'),
                    secure: port === '465',
                    auth: { user, pass },
                });
                this.logger.log(`[EMAIL] SMTP configurado: ${host}:${port}`);
            } catch {
                this.logger.warn('[EMAIL] nodemailer não instalado — usando mock');
            }
        }
    }

    async send(to: string, message: string) {
        const from = process.env.SMTP_FROM || 'noreply@nextclin.com.br';

        // Real mode: SMTP
        if (this.transporter) {
            try {
                const info = await this.transporter.sendMail({
                    from,
                    to,
                    subject: 'NextClin — Notificação',
                    text: message,
                    html: `<div style="font-family:sans-serif;padding:20px;"><p>${message.replace(/\n/g, '<br>')}</p><hr><small>NextClin © ${new Date().getFullYear()} Next Vision</small></div>`,
                });
                this.logger.log(`[EMAIL ✅] Enviado para ${to}: ${info.messageId}`);
                return { success: true, messageId: info.messageId };
            } catch (err: any) {
                this.logger.error(`[EMAIL ❌] Falha para ${to}: ${err.message}`);
                return { success: false, error: err.message };
            }
        }

        // Mock mode
        this.logger.warn(`[EMAIL MOCK] → ${to}: ${message.substring(0, 80)}...`);
        return { success: true, messageId: `email-mock-${Date.now()}` };
    }
}

export type ChannelType = 'whatsapp' | 'sms' | 'email';

/**
 * MessagingService — unified messaging with logging to MessageLog entity.
 */
@Injectable()
export class MessagingService {
    private readonly logger = new Logger(MessagingService.name);
    private channels: Record<ChannelType, IMessagingChannel>;

    constructor(
        @InjectRepository(MessageLog)
        private messageLogsRepo: Repository<MessageLog>,
    ) {
        this.channels = {
            whatsapp: new WhatsAppChannel(),
            sms: new SmsChannel(),
            email: new EmailChannel(),
        };
    }

    async send(channel: ChannelType, to: string, message: string, tenantId?: string, entityType?: string, entityId?: string) {
        const ch = this.channels[channel];
        if (!ch) {
            this.logger.error(`Canal desconhecido: ${channel}`);
            return { success: false, error: `Canal ${channel} não configurado` };
        }

        // Create log entry
        const log = this.messageLogsRepo.create({
            tenantId: tenantId || 'system',
            channel: channel as MessageChannel,
            recipient: to,
            content: message,
            status: MessageStatus.PENDING,
            entityType,
            entityId,
        });

        try {
            const result = await ch.send(to, message);
            log.status = result.success ? MessageStatus.SENT : MessageStatus.FAILED;
            log.externalId = result.messageId ?? log.externalId;
            log.error = result.error ?? log.error;
            if (result.success) log.sentAt = new Date();
            await this.messageLogsRepo.save(log);

            this.logger.log(`[${channel.toUpperCase()}] → ${to}: ${result.success ? '✅' : '❌'}`);
            return result;
        } catch (err: any) {
            log.status = MessageStatus.FAILED;
            log.error = err.message;
            await this.messageLogsRepo.save(log);

            this.logger.error(`[${channel.toUpperCase()}] Failed: ${err.message}`);
            return { success: false, error: err.message };
        }
    }

    async sendAppointmentReminder(phone: string, patientName: string, dateTime: string, tenantId?: string, entityId?: string) {
        const msg = `Olá ${patientName}! 🏥\n\nLembramos que você tem um agendamento no NextClin:\n📅 ${dateTime}\n\nEm caso de dúvida, entre em contato conosco.\n\n— Equipe NextClin`;
        return this.send('whatsapp', phone, msg, tenantId, 'appointment', entityId);
    }

    async sendNextDoseReminder(phone: string, patientName: string, vaccineName: string, doseDate: string, tenantId?: string, entityId?: string) {
        const msg = `Olá ${patientName}! 💉\n\nSua próxima dose de ${vaccineName} está agendada para ${doseDate}.\n\nNão esqueça!\n\n— Equipe NextClin`;
        return this.send('whatsapp', phone, msg, tenantId, 'application', entityId);
    }

    async sendOverduePaymentReminder(phone: string, patientName: string, amount: string, dueDate: string, tenantId?: string, entityId?: string) {
        const msg = `Olá ${patientName}!\n\nIdentificamos uma fatura vencida:\n💰 Valor: ${amount}\n📅 Vencimento: ${dueDate}\n\nPor favor, entre em contato para regularizar.\n\n— Equipe NextClin`;
        return this.send('whatsapp', phone, msg, tenantId, 'receivable', entityId);
    }

    async sendBatchExpiryAlert(email: string, batchInfo: string, tenantId?: string) {
        const msg = `⚠️ Alerta de Lotes Vencendo\n\n${batchInfo}\n\nVerifique o estoque e tome as providências necessárias.\n\n— NextClin Sistema`;
        return this.send('email', email, msg, tenantId, 'batch', undefined);
    }

    async sendLowStockAlert(email: string, stockInfo: string, tenantId?: string) {
        const msg = `⚠️ Alerta de Estoque Baixo\n\n${stockInfo}\n\nFaça o pedido de reposição.\n\n— NextClin Sistema`;
        return this.send('email', email, msg, tenantId, 'vaccine', undefined);
    }
}
