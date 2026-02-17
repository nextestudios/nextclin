import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nfse, NfseStatus } from './entities/nfse.entity';

/**
 * Mock NFSe Provider - simulates NFSe issuance.
 * In production, replace with actual municipal API integration.
 */
@Injectable()
export class NfseService {
    private readonly logger = new Logger(NfseService.name);

    constructor(
        @InjectRepository(Nfse)
        private nfseRepo: Repository<Nfse>,
    ) { }

    async issueNfse(tenantId: string, accountReceivableId: string, patientId: string): Promise<Nfse> {
        const nfse = this.nfseRepo.create({
            tenantId,
            accountReceivableId,
            patientId,
            status: NfseStatus.PROCESSING,
        });
        const saved = await this.nfseRepo.save(nfse);

        // Simulate async processing (in production: add to queue)
        try {
            await this.mockIssue(saved);
        } catch (err: any) {
            saved.status = NfseStatus.FAILED;
            saved.lastError = err.message;
            saved.retries += 1;
            await this.nfseRepo.save(saved);
        }

        return saved;
    }

    private async mockIssue(nfse: Nfse): Promise<void> {
        // Simulate API call
        this.logger.log(`[MOCK] Emitindo NFSe para conta ${nfse.accountReceivableId}...`);

        // 90% success rate simulation
        if (Math.random() > 0.1) {
            nfse.nfseNumber = `NFSE-${Date.now()}`;
            nfse.protocol = `PROT-${Date.now()}`;
            nfse.xml = `<NFSe><Numero>${nfse.nfseNumber}</Numero></NFSe>`;
            nfse.pdfUrl = `/nfse/${nfse.id}/pdf`;
            nfse.status = NfseStatus.ISSUED;
            await this.nfseRepo.save(nfse);
            this.logger.log(`[MOCK] NFSe ${nfse.nfseNumber} emitida com sucesso.`);
        } else {
            throw new Error('Simulação: Falha na comunicação com o provedor municipal.');
        }
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
            await this.mockIssue(nfse);
        } catch (err: any) {
            nfse.status = NfseStatus.FAILED;
            nfse.lastError = err.message;
            nfse.retries += 1;
            await this.nfseRepo.save(nfse);
        }
        return nfse;
    }
}
