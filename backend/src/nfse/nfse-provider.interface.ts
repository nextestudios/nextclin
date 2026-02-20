/**
 * NFSe Provider Interface — Abstract layer for multiple municipal API integrations.
 * Implement this interface for each municipality's NFSe API.
 */
export interface NfseProviderResponse {
    success: boolean;
    nfseNumber?: string;
    protocol?: string;
    xml?: string;
    pdfUrl?: string;
    errorMessage?: string;
}

export interface INfseProvider {
    /**
     * Emits an NFSe via the municipal API.
     */
    issue(data: {
        tenantId: string;
        patientName: string;
        patientCpf: string;
        serviceDescription: string;
        amount: number;
        issDate: Date;
    }): Promise<NfseProviderResponse>;

    /**
     * Cancels an already-issued NFSe.
     */
    cancel(nfseNumber: string, reason: string): Promise<NfseProviderResponse>;

    /**
     * Queries an NFSe by its number.
     */
    query(nfseNumber: string): Promise<NfseProviderResponse>;
}

/**
 * Mock Implementation — for development/testing.
 * Replace with real municipal integrations (e.g., ISS.NET, GINFES, BETHA).
 */
export class MockNfseProvider implements INfseProvider {
    async issue(data: {
        tenantId: string;
        patientName: string;
        patientCpf: string;
        serviceDescription: string;
        amount: number;
        issDate: Date;
    }): Promise<NfseProviderResponse> {
        // Simulate 90% success
        if (Math.random() > 0.1) {
            return {
                success: true,
                nfseNumber: `NFSE-${Date.now()}`,
                protocol: `PROT-${Date.now()}`,
                xml: `<NFSe><Numero>NFSE-${Date.now()}</Numero><Valor>${data.amount}</Valor></NFSe>`,
                pdfUrl: `/nfse/mock-${Date.now()}/pdf`,
            };
        }
        return {
            success: false,
            errorMessage: 'Simulação: Falha na comunicação com o provedor municipal.',
        };
    }

    async cancel(nfseNumber: string, reason: string): Promise<NfseProviderResponse> {
        return {
            success: true,
            nfseNumber,
            protocol: `CANCEL-${Date.now()}`,
        };
    }

    async query(nfseNumber: string): Promise<NfseProviderResponse> {
        return {
            success: true,
            nfseNumber,
            protocol: `QUERY-${Date.now()}`,
            xml: `<NFSe><Numero>${nfseNumber}</Numero><Status>EMITIDA</Status></NFSe>`,
        };
    }
}
