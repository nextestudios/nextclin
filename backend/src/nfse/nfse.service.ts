import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nfse, NfseStatus } from './entities/nfse.entity';
import { INfseProvider, MockNfseProvider } from './nfse-provider.interface';

const REDIS_CONNECTION = {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
};

@Injectable()
export class NfseService implements OnModuleInit {
    private readonly logger = new Logger(NfseService.name);
    private nfseQueue: Queue;
    private nfseWorker: Worker;
    private provider: INfseProvider;

    constructor(
        @InjectRepository(Nfse)
        private nfseRepo: Repository<Nfse>,
    ) {
        this.provider = new MockNfseProvider();
    }

    onModuleInit() {
        // Initialize BullMQ Queue
        this.nfseQueue = new Queue('nfse-processing', {
            connection: REDIS_CONNECTION,
            defaultJobOptions: {
                attempts: 3,
                backoff: { type: 'exponential', delay: 5000 },
                removeOnComplete: 100,
                removeOnFail: 50,
            },
        });

        // Initialize Worker
        this.nfseWorker = new Worker('nfse-processing', async (job: Job) => {
            return this.processNfseJob(job);
        }, {
            connection: REDIS_CONNECTION,
            concurrency: 2,
        });

        this.nfseWorker.on('completed', (job: Job) => {
            this.logger.log(`[QUEUE] Job ${job.id} completed: NFSe ${job.data.nfseId}`);
        });

        this.nfseWorker.on('failed', (job: Job | undefined, err: Error) => {
            this.logger.error(`[QUEUE] Job ${job?.id} failed: ${err.message}`);
        });

        this.logger.log('[QUEUE] NFSe BullMQ worker initialized.');
    }

    /**
     * Issue NFSe — adds to BullMQ queue for async processing.
     */
    async issueNfse(tenantId: string, accountReceivableId: string, patientId: string): Promise<Nfse> {
        const nfse = this.nfseRepo.create({
            tenantId,
            accountReceivableId,
            patientId,
            status: NfseStatus.PROCESSING,
        });
        const saved = await this.nfseRepo.save(nfse);

        // Add to queue instead of processing synchronously
        try {
            await this.nfseQueue.add('issue-nfse', {
                nfseId: saved.id,
                tenantId,
                accountReceivableId,
                patientId,
            });
            this.logger.log(`[QUEUE] NFSe ${saved.id} added to queue.`);
        } catch (err: any) {
            // Fallback: process synchronously if Redis is unavailable
            this.logger.warn(`[QUEUE] Redis unavailable, processing synchronously: ${err.message}`);
            await this.processSynchronously(saved);
        }

        return saved;
    }

    /**
     * BullMQ job processor — called by the worker for each queued NFSe.
     */
    private async processNfseJob(job: Job): Promise<void> {
        const { nfseId } = job.data;
        const nfse = await this.nfseRepo.findOne({ where: { id: nfseId } });
        if (!nfse) throw new Error(`NFSe ${nfseId} not found`);

        const result = await this.provider.issue({
            tenantId: nfse.tenantId,
            patientName: 'Patient', // In production: resolve from patient entity
            patientCpf: '',
            serviceDescription: 'Serviço de vacinação',
            amount: 0,
            issDate: new Date(),
        });

        if (result.success) {
            nfse.nfseNumber = result.nfseNumber || '';
            nfse.protocol = result.protocol || '';
            nfse.xml = result.xml || '';
            nfse.pdfUrl = result.pdfUrl || '';
            nfse.status = NfseStatus.ISSUED;
        } else {
            nfse.status = NfseStatus.FAILED;
            nfse.lastError = result.errorMessage || 'Unknown error';
            nfse.retries += 1;
            throw new Error(result.errorMessage); // triggers BullMQ retry
        }

        await this.nfseRepo.save(nfse);
    }

    /**
     * Fallback: synchronous processing when Redis is unavailable.
     */
    private async processSynchronously(nfse: Nfse): Promise<void> {
        try {
            const result = await this.provider.issue({
                tenantId: nfse.tenantId,
                patientName: 'Patient',
                patientCpf: '',
                serviceDescription: 'Serviço de vacinação',
                amount: 0,
                issDate: new Date(),
            });

            if (result.success) {
                nfse.nfseNumber = result.nfseNumber || '';
                nfse.protocol = result.protocol || '';
                nfse.xml = result.xml || '';
                nfse.pdfUrl = result.pdfUrl || '';
                nfse.status = NfseStatus.ISSUED;
            } else {
                nfse.status = NfseStatus.FAILED;
                nfse.lastError = result.errorMessage || 'Unknown error';
                nfse.retries += 1;
            }
        } catch (err: any) {
            nfse.status = NfseStatus.FAILED;
            nfse.lastError = err.message;
            nfse.retries += 1;
        }

        await this.nfseRepo.save(nfse);
    }

    async findAll(tenantId: string): Promise<Nfse[]> {
        return this.nfseRepo.find({ where: { tenantId }, order: { createdAt: 'DESC' } });
    }

    async retry(tenantId: string, id: string): Promise<Nfse> {
        const nfse = await this.nfseRepo.findOne({ where: { id, tenantId } });
        if (!nfse) throw new Error('NFSe não encontrada.');
        nfse.status = NfseStatus.PROCESSING;
        await this.nfseRepo.save(nfse);

        try {
            await this.nfseQueue.add('retry-nfse', { nfseId: nfse.id, tenantId });
        } catch {
            await this.processSynchronously(nfse);
        }

        return nfse;
    }

    /**
     * Get queue stats for monitoring.
     */
    async getQueueStats() {
        try {
            const waiting = await this.nfseQueue.getWaitingCount();
            const active = await this.nfseQueue.getActiveCount();
            const completed = await this.nfseQueue.getCompletedCount();
            const failed = await this.nfseQueue.getFailedCount();
            return { waiting, active, completed, failed };
        } catch {
            return { waiting: 0, active: 0, completed: 0, failed: 0, error: 'Redis unavailable' };
        }
    }
}
