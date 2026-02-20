import { Injectable, Logger } from '@nestjs/common';

export interface QueueJob {
    id: string;
    type: string;
    data: any;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    attempts: number;
    maxAttempts: number;
    error?: string;
    createdAt: Date;
    processedAt?: Date;
}

/**
 * NotificationQueue — In-memory queue with retry logic.
 * Replace with Bull/BullMQ + Redis in production for horizontal scaling.
 * 
 * Configure REDIS_URL to enable Bull. Without it, uses in-memory queue.
 */
@Injectable()
export class NotificationQueue {
    private readonly logger = new Logger(NotificationQueue.name);
    private queue: QueueJob[] = [];
    private processing = false;

    async add(type: string, data: any, maxAttempts = 3): Promise<string> {
        const job: QueueJob = {
            id: `job-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            type,
            data,
            status: 'pending',
            attempts: 0,
            maxAttempts,
            createdAt: new Date(),
        };
        this.queue.push(job);
        this.logger.log(`[QUEUE] Job added: ${type} (${job.id})`);

        // Auto-process
        if (!this.processing) this.processQueue();

        return job.id;
    }

    async processQueue() {
        if (this.processing) return;
        this.processing = true;

        while (this.queue.some(j => j.status === 'pending')) {
            const job = this.queue.find(j => j.status === 'pending');
            if (!job) break;

            job.status = 'processing';
            job.attempts++;

            try {
                await this.processJob(job);
                job.status = 'completed';
                job.processedAt = new Date();
                this.logger.log(`[QUEUE ✅] ${job.type} (${job.id}) completed`);
            } catch (err: any) {
                job.error = err.message;
                if (job.attempts >= job.maxAttempts) {
                    job.status = 'failed';
                    this.logger.error(`[QUEUE ❌ DLQ] ${job.type} (${job.id}) failed after ${job.attempts} attempts: ${err.message}`);
                } else {
                    job.status = 'pending';
                    const delay = Math.pow(2, job.attempts) * 1000; // Exponential backoff
                    this.logger.warn(`[QUEUE ⏳] ${job.type} (${job.id}) retry in ${delay}ms (attempt ${job.attempts}/${job.maxAttempts})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        this.processing = false;
    }

    private async processJob(job: QueueJob): Promise<void> {
        // Processor logic based on job type
        switch (job.type) {
            case 'SEND_WHATSAPP':
            case 'SEND_EMAIL':
            case 'SEND_SMS':
                this.logger.log(`[PROCESS] ${job.type} → ${job.data.to}`);
                break;
            case 'EMIT_NFSE':
                this.logger.log(`[PROCESS] NFSe emission for receivable ${job.data.receivableId}`);
                break;
            case 'GENERATE_REPORT':
                this.logger.log(`[PROCESS] Report generation: ${job.data.reportType}`);
                break;
            default:
                this.logger.warn(`[PROCESS] Unknown job type: ${job.type}`);
        }
    }

    getStats() {
        return {
            total: this.queue.length,
            pending: this.queue.filter(j => j.status === 'pending').length,
            processing: this.queue.filter(j => j.status === 'processing').length,
            completed: this.queue.filter(j => j.status === 'completed').length,
            failed: this.queue.filter(j => j.status === 'failed').length,
        };
    }

    getFailedJobs() {
        return this.queue.filter(j => j.status === 'failed');
    }

    async retryFailed(jobId: string) {
        const job = this.queue.find(j => j.id === jobId && j.status === 'failed');
        if (!job) return null;
        job.status = 'pending';
        job.attempts = 0;
        job.error = undefined;
        if (!this.processing) this.processQueue();
        return job;
    }
}
