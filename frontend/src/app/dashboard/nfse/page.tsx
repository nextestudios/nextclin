'use client';

import { useEffect, useState } from 'react';
import api from '../../../services/api';

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
    PENDING: 'bg-yellow-100 text-yellow-700',
    PROCESSING: 'bg-blue-100 text-blue-700',
    ISSUED: 'bg-emerald-100 text-emerald-700',
    FAILED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-slate-100 text-slate-500',
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
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">📄 Notas Fiscais (NFSe)</h1>
                <p className="text-slate-500 text-sm">Emissão e acompanhamento de NFSe</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Número</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Protocolo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {records.map(r => (
                            <tr key={r.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-sm text-slate-600">{new Date(r.createdAt).toLocaleDateString('pt-BR')}</td>
                                <td className="px-6 py-4 text-sm font-mono text-slate-800">{r.nfseNumber || '-'}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{r.protocol || '-'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                                        {r.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {r.status === 'FAILED' && (
                                        <button onClick={() => retry(r.id)} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs hover:bg-amber-200">
                                            🔄 Retentar ({r.retries})
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {records.length === 0 && (
                    <div className="p-12 text-center text-slate-400">Nenhuma NFSe emitida.</div>
                )}
            </div>
        </div>
    );
}
