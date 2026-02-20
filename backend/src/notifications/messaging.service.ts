import { Injectable, Logger } from '@nestjs/common';

/**
 * Messaging Channel Interface — abstraction for WhatsApp, SMS, Email.
 * Implement this interface for each channel provider.
 */
export interface IMessagingChannel {
    send(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

/**
 * WhatsApp Channel (Mock) — replace with Evolution API, Z-API, Twilio, etc.
 */
export class WhatsAppChannel implements IMessagingChannel {
    private readonly logger = new Logger('WhatsAppChannel');

    async send(to: string, message: string) {
        // TODO: Replace with actual WhatsApp API integration
        // Example providers: Evolution API, Z-API, Twilio WhatsApp, Meta Cloud API
        const phone = to.replace(/\D/g, '');
        this.logger.log(`[WHATSAPP] → ${phone}: ${message.substring(0, 50)}...`);

        // Mock: simulate API call
        return {
            success: true,
            messageId: `wa-${Date.now()}-${phone}`,
        };
    }
}

/**
 * SMS Channel (Mock) — replace with Twilio, Zenvia, Total Voice, etc.
 */
export class SmsChannel implements IMessagingChannel {
    private readonly logger = new Logger('SmsChannel');

    async send(to: string, message: string) {
        // TODO: Replace with actual SMS API integration
        // Example providers: Twilio, Zenvia, Total Voice, AWS SNS
        const phone = to.replace(/\D/g, '');
        this.logger.log(`[SMS] → ${phone}: ${message.substring(0, 160)}`);

        return {
            success: true,
            messageId: `sms-${Date.now()}-${phone}`,
        };
    }
}

/**
 * Email Channel (Mock) — replace with SendGrid, SES, Resend, Nodemailer, etc.
 */
export class EmailChannel implements IMessagingChannel {
    private readonly logger = new Logger('EmailChannel');

    async send(to: string, message: string) {
        this.logger.log(`[EMAIL] → ${to}: ${message.substring(0, 80)}...`);

        return {
            success: true,
            messageId: `email-${Date.now()}`,
        };
    }
}

export type ChannelType = 'whatsapp' | 'sms' | 'email';

/**
 * MessagingService — unified interface to send messages via multiple channels.
 * Uses mock implementations by default; replace with real providers in production.
 */
@Injectable()
export class MessagingService {
    private readonly logger = new Logger(MessagingService.name);
    private channels: Record<ChannelType, IMessagingChannel>;

    constructor() {
        this.channels = {
            whatsapp: new WhatsAppChannel(),
            sms: new SmsChannel(),
            email: new EmailChannel(),
        };
    }

    async send(channel: ChannelType, to: string, message: string) {
        const ch = this.channels[channel];
        if (!ch) {
            this.logger.error(`Canal desconhecido: ${channel}`);
            return { success: false, error: `Canal ${channel} não configurado` };
        }

        try {
            const result = await ch.send(to, message);
            this.logger.log(`[${channel.toUpperCase()}] Sent to ${to}: ${result.success ? '✅' : '❌'}`);
            return result;
        } catch (err: any) {
            this.logger.error(`[${channel.toUpperCase()}] Failed to send to ${to}: ${err.message}`);
            return { success: false, error: err.message };
        }
    }

    async sendAppointmentReminder(phone: string, patientName: string, dateTime: string) {
        const msg = `Olá ${patientName}! 🏥\n\nLembramos que você tem um agendamento no NextClin:\n📅 ${dateTime}\n\nEm caso de dúvida, entre em contato conosco.\n\n— Equipe NextClin`;
        return this.send('whatsapp', phone, msg);
    }

    async sendNextDoseReminder(phone: string, patientName: string, vaccineName: string, doseDate: string) {
        const msg = `Olá ${patientName}! 💉\n\nSua próxima dose de ${vaccineName} está agendada para ${doseDate}.\n\nNão esqueça!\n\n— Equipe NextClin`;
        return this.send('whatsapp', phone, msg);
    }

    async sendOverduePaymentReminder(phone: string, patientName: string, amount: string, dueDate: string) {
        const msg = `Olá ${patientName}!\n\nIdentificamos uma fatura vencida:\n💰 Valor: ${amount}\n📅 Vencimento: ${dueDate}\n\nPor favor, entre em contato para regularizar.\n\n— Equipe NextClin`;
        return this.send('whatsapp', phone, msg);
    }
}
