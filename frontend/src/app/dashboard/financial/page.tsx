'use client';

import { useEffect, useState } from 'react';
import api from '../../../services/api';

interface Receivable {
    id: string;
    amount: number;
    status: string;
    dueDate: string;
    paymentMethod: string;
    patientId: string;
}

const statusColors: Record<string, string> = {
    OPEN: 'bg-blue-100 text-blue-700',
    PAID: 'bg-emerald-100 text-emerald-700',
    OVERDUE: 'bg-red-100 text-red-700',
    NEGOTIATION: 'bg-amber-100 text-amber-700',
    CANCELLED: 'bg-slate-100 text-slate-500',
};

const statusLabels: Record<string, string> = {
    OPEN: 'Em Aberto',
    PAID: 'Pago',
    OVERDUE: 'Atrasado',
    NEGOTIATION: 'Negociação',
    CANCELLED: 'Cancelado',
};

export default function FinancialPage() {
    const [receivables, setReceivables] = useState<Receivable[]>([]);
    const [tab, setTab] = useState<'receivables' | 'payables'>('receivables');

    useEffect(() => { loadData(); }, [tab]);

    async function loadData() {
        try {
            const res = await api.get(`/financial/${tab}`);
            setReceivables(res.data);
        } catch { }
    }

    async function markPaid(id: string) {
        try {
            await api.put(`/financial/${tab}/${id}/pay`);
            loadData();
        } catch { }
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">💰 Financeiro</h1>
                <p className="text-slate-500 text-sm">Contas a receber e a pagar</p>
            </div>

            <div className="flex gap-2 mb-6">
                <button onClick={() => setTab('receivables')} className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${tab === 'receivables' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    💳 A Receber
                </button>
                <button onClick={() => setTab('payables')} className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${tab === 'payables' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    📋 A Pagar
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Vencimento</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Valor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {receivables.map(r => (
                            <tr key={r.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-sm text-slate-600">{new Date(r.dueDate).toLocaleDateString('pt-BR')}</td>
                                <td className="px-6 py-4 text-sm font-semibold text-slate-800">R$ {Number(r.amount).toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                                        {statusLabels[r.status] || r.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {(r.status === 'OPEN' || r.status === 'PENDING') && (
                                        <button onClick={() => markPaid(r.id)} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs hover:bg-emerald-200 transition-colors">
                                            ✅ Marcar Pago
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {receivables.length === 0 && (
                    <div className="p-12 text-center text-slate-400">Nenhum registro encontrado.</div>
                )}
            </div>
        </div>
    );
}
