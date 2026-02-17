'use client';

import { useEffect, useState } from 'react';
import api from '../../../services/api';

interface Movement {
    id: string;
    type: string;
    reason: string;
    quantity: number;
    batch: { lotNumber: string; vaccine?: { name: string } };
    createdAt: string;
}

const reasonLabels: Record<string, string> = {
    PURCHASE: 'Compra', RETURN: 'Devolução', APPLICATION: 'Aplicação',
    LOSS: 'Perda', EXPIRED: 'Vencida', ADJUSTMENT: 'Ajuste',
};

export default function StockPage() {
    const [movements, setMovements] = useState<Movement[]>([]);

    useEffect(() => { loadMovements(); }, []);

    async function loadMovements() {
        try { const res = await api.get('/stock/movements'); setMovements(res.data); } catch { }
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">📦 Estoque</h1>
                <p className="text-slate-500 text-sm">Movimentações de estoque</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Motivo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Lote</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Qtd</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {movements.map(m => (
                            <tr key={m.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-sm text-slate-600">{new Date(m.createdAt).toLocaleDateString('pt-BR')}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${m.type === 'ENTRY' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {m.type === 'ENTRY' ? '📥 Entrada' : '📤 Saída'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{reasonLabels[m.reason] || m.reason}</td>
                                <td className="px-6 py-4 text-sm font-mono text-slate-600">{m.batch?.lotNumber}</td>
                                <td className="px-6 py-4 text-sm font-semibold text-right">{m.type === 'ENTRY' ? '+' : '-'}{m.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {movements.length === 0 && (
                    <div className="p-12 text-center text-slate-400">Nenhuma movimentação registrada.</div>
                )}
            </div>
        </div>
    );
}
