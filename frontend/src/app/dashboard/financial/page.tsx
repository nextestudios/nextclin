'use client';

import { useState, useEffect } from 'react';
import api from '../../../services/api';

const statusLabels: Record<string, string> = {
    OPEN: 'Aberto', PAID: 'Pago', OVERDUE: 'Vencido', NEGOTIATION: 'Negociação', CANCELLED: 'Cancelado',
    PENDING: 'Pendente',
};
const statusColors: Record<string, string> = {
    OPEN: 'bg-yellow-100 text-yellow-800', PAID: 'bg-green-100 text-green-800', OVERDUE: 'bg-red-100 text-red-800',
    NEGOTIATION: 'bg-blue-100 text-blue-800', CANCELLED: 'bg-gray-100 text-gray-500',
    PENDING: 'bg-yellow-100 text-yellow-800',
};

export default function FinancialPage() {
    const [receivables, setReceivables] = useState<any[]>([]);
    const [payables, setPayables] = useState<any[]>([]);
    const [tab, setTab] = useState<'receivable' | 'payable'>('receivable');
    const [showForm, setShowForm] = useState(false);
    const [patients, setPatients] = useState<any[]>([]);
    const [arForm, setArForm] = useState({ attendanceId: '', patientId: '', amount: 0, paymentMethod: 'PIX', dueDate: '', notes: '' });
    const [apForm, setApForm] = useState({ description: '', amount: 0, costCenter: '', dueDate: '', notes: '' });

    const load = () => {
        api.get('/financial/receivables').then(r => setReceivables(r.data)).catch(console.error);
        api.get('/financial/payables').then(r => setPayables(r.data)).catch(console.error);
        api.get('/patients').then(r => setPatients(r.data)).catch(console.error);
    };
    useEffect(() => { load(); }, []);

    const createReceivable = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/financial/receivables', arForm);
            load(); setShowForm(false);
        } catch (err) { console.error(err); }
    };

    const createPayable = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/financial/payables', apForm);
            load(); setShowForm(false);
        } catch (err) { console.error(err); }
    };

    const markPaid = async (type: 'receivable' | 'payable', id: string) => {
        const endpoint = type === 'receivable' ? `/financial/receivables/${id}/pay` : `/financial/payables/${id}/pay`;
        await api.patch(endpoint);
        load();
    };

    const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Financeiro</h1>
                <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    {showForm ? 'Cancelar' : '+ Nova Conta'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
                <button onClick={() => setTab('receivable')} className={`px-4 py-2 rounded-lg font-medium ${tab === 'receivable' ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    💰 A Receber ({receivables.length})
                </button>
                <button onClick={() => setTab('payable')} className={`px-4 py-2 rounded-lg font-medium ${tab === 'payable' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    💸 A Pagar ({payables.length})
                </button>
            </div>

            {/* Form */}
            {showForm && tab === 'receivable' && (
                <form onSubmit={createReceivable} className="bg-white rounded-xl shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Paciente *</label>
                        <select value={arForm.patientId} onChange={e => setArForm({ ...arForm, patientId: e.target.value })} required
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black">
                            <option value="">Selecione</option>
                            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$) *</label>
                        <input type="number" step="0.01" value={arForm.amount} onChange={e => setArForm({ ...arForm, amount: Number(e.target.value) })} required
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Forma de Pagamento</label>
                        <select value={arForm.paymentMethod} onChange={e => setArForm({ ...arForm, paymentMethod: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black">
                            <option value="PIX">PIX</option>
                            <option value="CREDIT_CARD">Cartão de Crédito</option>
                            <option value="DEBIT_CARD">Cartão de Débito</option>
                            <option value="CASH">Dinheiro</option>
                            <option value="BANK_SLIP">Boleto</option>
                            <option value="INSURANCE">Convênio</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Vencimento *</label>
                        <input type="date" value={arForm.dueDate} onChange={e => setArForm({ ...arForm, dueDate: e.target.value })} required
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                        <input type="text" value={arForm.notes} onChange={e => setArForm({ ...arForm, notes: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" placeholder="Notas" />
                    </div>
                    <div className="md:col-span-2">
                        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">Criar Conta a Receber</button>
                    </div>
                </form>
            )}

            {showForm && tab === 'payable' && (
                <form onSubmit={createPayable} className="bg-white rounded-xl shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Descrição *</label>
                        <input type="text" value={apForm.description} onChange={e => setApForm({ ...apForm, description: e.target.value })} required
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" placeholder="Ex: Aluguel, Fornecedor..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$) *</label>
                        <input type="number" step="0.01" value={apForm.amount} onChange={e => setApForm({ ...apForm, amount: Number(e.target.value) })} required
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Centro de Custo</label>
                        <input type="text" value={apForm.costCenter} onChange={e => setApForm({ ...apForm, costCenter: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" placeholder="Ex: Operacional" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Vencimento *</label>
                        <input type="date" value={apForm.dueDate} onChange={e => setApForm({ ...apForm, dueDate: e.target.value })} required
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" />
                    </div>
                    <div className="md:col-span-2">
                        <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">Criar Conta a Pagar</button>
                    </div>
                </form>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">{tab === 'receivable' ? 'Paciente' : 'Descrição'}</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Valor</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Vencimento</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Status</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(tab === 'receivable' ? receivables : payables).map((item: any) => (
                            <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50">
                                <td className="px-4 py-3 text-slate-800">{tab === 'receivable' ? (item.patient?.name || '-') : item.description}</td>
                                <td className="px-4 py-3 font-medium text-slate-800">{formatCurrency(item.amount)}</td>
                                <td className="px-4 py-3 text-slate-600">{new Date(item.dueDate).toLocaleDateString('pt-BR')}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[item.status] || ''}`}>
                                        {statusLabels[item.status] || item.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {(item.status === 'OPEN' || item.status === 'PENDING') && (
                                        <button onClick={() => markPaid(tab, item.id)} className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
                                            Marcar Pago
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {(tab === 'receivable' ? receivables : payables).length === 0 && (
                            <tr><td colSpan={5} className="text-center py-8 text-slate-400">Nenhuma conta encontrada.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
