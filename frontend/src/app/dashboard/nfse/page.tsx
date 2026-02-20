'use client';

import { useEffect, useState } from 'react';
import api from '../../../services/api';
import { ReceiptText, RefreshCw, AlertCircle } from 'lucide-react';

interface NfseRecord {
    id: string;
    nfseNumber: string;
    status: string;
    protocol: string;
    retries: number;
    lastError: string;
    createdAt: string;
}

const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
    ISSUED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    FAILED: 'bg-rose-50 text-rose-700 border-rose-200',
    CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
};

const statusLabels: Record<string, string> = {
    PENDING: 'Pendente',
    PROCESSING: 'Processando P.M.',
    ISSUED: 'Emitida c/ Sucesso',
    FAILED: 'Falha na Transmissão',
    CANCELLED: 'Cancelada/Inutilizada',
};

export default function NfsePage() {
    const [records, setRecords] = useState<NfseRecord[]>([]);

    useEffect(() => { loadRecords(); }, []);

    async function loadRecords() {
        try { const res = await api.get('/nfse'); setRecords(res.data); } catch { }
    }

    async function retry(id: string) {
        try { await api.post(`/nfse/${id}/retry`); loadRecords(); }
        catch { }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 bg-white p-6 saas-card">
                <div className="bg-teal-100 p-2 text-teal-700 rounded-sm">
                    <ReceiptText size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notas Fiscais de Serviço Eletrônicas (NFS-e)</h1>
                    <p className="text-slate-500 text-sm mt-1">Gestão de emissão, acompanhamento de RPS e retentativas no portal da prefeitura</p>
                </div>
            </div>

            <div className="saas-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data do RPS</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Número NFS-e</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Protocolo Sec. Fazenda</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Integração</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Governança Técnica</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {records.map(r => (
                                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                                        {new Date(r.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-mono text-lg font-bold text-slate-800 tracking-tight">{r.nfseNumber || 'PROCESSANDO'}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-sm border border-slate-200">{r.protocol || 'AGUARDANDO SYNC'}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-sm border ${statusColors[r.status] || ''}`}>
                                            {statusLabels[r.status] || r.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right flex justify-end">
                                        {r.status === 'FAILED' ? (
                                            <button
                                                onClick={() => retry(r.id)}
                                                className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-300 rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-amber-100 hover:text-amber-800 transition-colors flex items-center gap-1.5 shadow-sm"
                                            >
                                                <RefreshCw size={12} strokeWidth={3} /> Forçar Retentativa ({r.retries})
                                            </button>
                                        ) : (
                                            <span className="text-slate-400 text-xs font-medium flex items-center gap-1 justify-end">
                                                Auditoria OK
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {records.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-16 text-center text-slate-400">
                                        <ReceiptText size={48} className="mx-auto mb-4 opacity-20" />
                                        <p className="font-medium text-lg text-slate-500">Nenhum lote de NFS-e ou RPS gerado no período.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
