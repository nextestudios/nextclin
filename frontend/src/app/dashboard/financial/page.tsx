'use client';

import { useState, useEffect } from 'react';
import api from '../../../services/api';
import {
    Wallet, TrendingUp, TrendingDown,
    Plus, X, Check, ArrowRight,
    CircleDollarSign, FileBadge
} from 'lucide-react';

const statusLabels: Record<string, string> = {
    OPEN: 'Aberto', PAID: 'Liquidado', OVERDUE: 'Atrasado', NEGOTIATION: 'Contestado', CANCELLED: 'Baixado',
    PENDING: 'Pendente',
};

const statusColors: Record<string, string> = {
    OPEN: 'bg-amber-50 text-amber-700 border-amber-200',
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    OVERDUE: 'bg-rose-50 text-rose-700 border-rose-200',
    NEGOTIATION: 'bg-purple-50 text-purple-700 border-purple-200',
    CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
    PENDING: 'bg-blue-50 text-blue-700 border-blue-200',
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
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 saas-card">
                <div className="flex items-center gap-3">
                    <div className="bg-teal-100 p-2 text-teal-700 rounded-sm">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financeiro Corporativo</h1>
                        <p className="text-slate-500 text-sm mt-1">Gestão central de Títulos a Receber (AR) e Contas a Pagar (AP)</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={showForm ? "saas-button-secondary" : "saas-button-primary"}
                >
                    {showForm ? <><X size={18} /> Cancelar Documento</> : <><Plus size={18} /> Lançar Novo Título</>}
                </button>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex gap-4 border-b border-slate-200">
                <button
                    onClick={() => { setTab('receivable'); setShowForm(false); }}
                    className={`py-3 px-6 font-semibold flex items-center gap-2 border-b-2 transition-all ${tab === 'receivable'
                            ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                            : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                >
                    <TrendingUp size={18} className={tab === 'receivable' ? 'text-emerald-500' : 'text-slate-400'} />
                    Contas a Receber
                    <span className="ml-2 bg-white border border-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {receivables.length}
                    </span>
                </button>
                <button
                    onClick={() => { setTab('payable'); setShowForm(false); }}
                    className={`py-3 px-6 font-semibold flex items-center gap-2 border-b-2 transition-all ${tab === 'payable'
                            ? 'border-rose-600 text-rose-700 bg-rose-50/50'
                            : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                >
                    <TrendingDown size={18} className={tab === 'payable' ? 'text-rose-500' : 'text-slate-400'} />
                    Contas a Pagar
                    <span className="ml-2 bg-white border border-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {payables.length}
                    </span>
                </button>
            </div>

            {/* Forms */}
            {showForm && tab === 'receivable' && (
                <form onSubmit={createReceivable} className="saas-card p-8 bg-white border-t-4 border-t-emerald-600">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
                        <CircleDollarSign size={20} className="text-emerald-600" /> Emitir Conta a Receber (Paciente)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="saas-label">Atrelar ao Paciente *</label>
                            <select value={arForm.patientId} onChange={e => setArForm({ ...arForm, patientId: e.target.value })} required className="saas-input">
                                <option value="">Sem vínculo estabelecido</option>
                                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="saas-label">Montante Faturado (R$) *</label>
                            <input type="number" step="0.01" value={arForm.amount} onChange={e => setArForm({ ...arForm, amount: Number(e.target.value) })} required className="saas-input border-emerald-200 focus:ring-emerald-500 text-lg font-bold" />
                        </div>
                        <div>
                            <label className="saas-label">Canal de Liquidação Esperado</label>
                            <select value={arForm.paymentMethod} onChange={e => setArForm({ ...arForm, paymentMethod: e.target.value })} className="saas-input font-medium uppercase text-xs tracking-wider">
                                <option value="PIX">Transferência via PIX</option>
                                <option value="CREDIT_CARD">Processamento de Cartão de Crédito</option>
                                <option value="DEBIT_CARD">Processamento de Cartão de Débito</option>
                                <option value="CASH">Moeda Corrente Física</option>
                                <option value="BANK_SLIP">Emissão de Boleto Bancário</option>
                                <option value="INSURANCE">Faturamento a Convênio (Lote)</option>
                            </select>
                        </div>
                        <div>
                            <label className="saas-label">Prazo Final Legal (Data) *</label>
                            <input type="date" value={arForm.dueDate} onChange={e => setArForm({ ...arForm, dueDate: e.target.value })} required className="saas-input" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="saas-label">Notas e Termos</label>
                            <input type="text" value={arForm.notes} onChange={e => setArForm({ ...arForm, notes: e.target.value })} className="saas-input" placeholder="Detalhes do contrato, pacote vendido..." />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
                        <button type="submit" className="saas-button-primary bg-emerald-600 hover:bg-emerald-700">Validar e Emitir Título</button>
                    </div>
                </form>
            )}

            {showForm && tab === 'payable' && (
                <form onSubmit={createPayable} className="saas-card p-8 bg-white border-t-4 border-t-rose-600">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
                        <FileBadge size={20} className="text-rose-600" /> Registrar Conta a Pagar (Obrigação)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="saas-label">Descrição da Obrigação Fiscal/Civil *</label>
                            <input type="text" value={apForm.description} onChange={e => setApForm({ ...apForm, description: e.target.value })} required className="saas-input" placeholder="Ex: Fatura Fornecedor Biológico, Aluguel Corporativo..." />
                        </div>
                        <div>
                            <label className="saas-label">Montante Devido (R$) *</label>
                            <input type="number" step="0.01" value={apForm.amount} onChange={e => setApForm({ ...apForm, amount: Number(e.target.value) })} required className="saas-input border-rose-200 focus:ring-rose-500 text-lg font-bold" />
                        </div>
                        <div>
                            <label className="saas-label">Alocação de Centro de Custo</label>
                            <input type="text" value={apForm.costCenter} onChange={e => setApForm({ ...apForm, costCenter: e.target.value })} className="saas-input uppercase text-xs tracking-wider" placeholder="Ex: OP-CLINICA-SP" />
                        </div>
                        <div>
                            <label className="saas-label">Data Limite de Compensação *</label>
                            <input type="date" value={apForm.dueDate} onChange={e => setApForm({ ...apForm, dueDate: e.target.value })} required className="saas-input" />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
                        <button type="submit" className="saas-button-primary bg-rose-600 hover:bg-rose-700">Protocolar Obrigação Título</button>
                    </div>
                </form>
            )}

            {/* Table */}
            <div className="saas-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    {tab === 'receivable' ? 'Sujeito/Cliente Relacionado' : 'Descrição/Favorecido'}
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Montante Fiscal</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Deadline</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status Lógico</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Governança</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {(tab === 'receivable' ? receivables : payables).map((item: any) => (
                                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {tab === 'receivable' ? (item.patient?.name || '-') : item.description}
                                        {item.costCenter && <div className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-widest">{item.costCenter}</div>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className={`font-bold tracking-tight text-lg ${tab === 'receivable' ? 'text-emerald-700' : 'text-slate-800'}`}>
                                            {formatCurrency(item.amount)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-sm font-medium text-center">
                                        {new Date(item.dueDate).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`text-[10px] px-2.5 py-1 rounded-sm uppercase tracking-wider font-bold border ${statusColors[item.status] || ''}`}>
                                            {statusLabels[item.status] || item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right flex justify-end">
                                        {(item.status === 'OPEN' || item.status === 'PENDING') ? (
                                            <button
                                                onClick={() => markPaid(tab, item.id)}
                                                className="text-[11px] font-bold tracking-wider uppercase bg-white border border-slate-300 text-slate-600 px-3 py-1.5 rounded-sm hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-1.5 opacity-80 group-hover:opacity-100"
                                            >
                                                Liquidar <ArrowRight size={12} strokeWidth={3} />
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-slate-400 text-sm font-medium pr-2">
                                                <Check size={16} /> Auditado
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {(tab === 'receivable' ? receivables : payables).length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-slate-300">
                                        {tab === 'receivable' ? <TrendingUp size={48} className="mx-auto mb-4 opacity-50 text-emerald-200" /> : <TrendingDown size={48} className="mx-auto mb-4 opacity-50 text-rose-200" />}
                                        <p className="font-medium text-slate-500">Nenhum evento contábil listado nesse escopo.</p>
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
