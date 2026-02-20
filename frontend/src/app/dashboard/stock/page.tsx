'use client';

import { useState, useEffect } from 'react';
import api from '../../../services/api';
import {
    PackageSearch, PackagePlus, PackageMinus,
    ArrowDownLeft, ArrowUpRight, CheckCircle2,
    X, Plus
} from 'lucide-react';

interface Movement {
    id: string;
    type: string;
    reason: string;
    quantity: number;
    notes: string;
    createdAt: string;
    batch?: { lotNumber: string; vaccine?: { name: string } };
}

const reasonLabels: Record<string, string> = {
    PURCHASE: 'Compra/Aquisição', RETURN: 'Devolução de Cliente', APPLICATION: 'Aplicação/Uso Clínico',
    LOSS: 'Perda/Dano', EXPIRED: 'Vencimento', ADJUSTMENT: 'Ajuste de Inventário',
};

export default function StockPage() {
    const [movements, setMovements] = useState<Movement[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [batches, setBatches] = useState<any[]>([]);
    const [formType, setFormType] = useState<'ENTRY' | 'EXIT'>('ENTRY');
    const [form, setForm] = useState({ batchId: '', quantity: 1, reason: 'PURCHASE', notes: '' });

    const load = () => {
        api.get('/stock/movements').then(r => setMovements(r.data)).catch(console.error);
        api.get('/vaccines/batches').then(r => setBatches(r.data)).catch(console.error);
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const endpoint = formType === 'ENTRY' ? '/stock/entry' : '/stock/exit';
            await api.post(endpoint, form);
            load();
            setShowForm(false);
            setForm({ batchId: '', quantity: 1, reason: 'PURCHASE', notes: '' });
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erro ao registrar movimentação');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 saas-card">
                <div className="flex items-center gap-3">
                    <div className="bg-teal-100 p-2 text-teal-700 rounded-sm">
                        <PackageSearch size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Controle de Estoque</h1>
                        <p className="text-slate-500 text-sm mt-1">Registro de entradas e saídas de lotes da câmara fria</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={showForm ? "saas-button-secondary" : "saas-button-primary"}
                >
                    {showForm ? <><X size={18} /> Cancelar Operação</> : <><Plus size={18} /> Nova Operação</>}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className={`saas-card p-8 bg-white border-t-4 ${formType === 'ENTRY' ? 'border-t-emerald-600' : 'border-t-rose-600'}`}>
                    <h3 className="text-lg font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">
                        Detalhes da Operação de Estoque
                    </h3>

                    {/* Operation Type Switch */}
                    <div className="flex gap-4 mb-8 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <button
                            type="button"
                            onClick={() => { setFormType('ENTRY'); setForm({ ...form, reason: 'PURCHASE' }); }}
                            className={`flex-1 py-3 px-4 rounded-sm font-semibold flex items-center justify-center gap-2 transition-all ${formType === 'ENTRY'
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'text-slate-500 hover:bg-slate-200'
                                }`}
                        >
                            <PackagePlus size={18} /> Entrada de Lote
                        </button>
                        <button
                            type="button"
                            onClick={() => { setFormType('EXIT'); setForm({ ...form, reason: 'LOSS' }); }}
                            className={`flex-1 py-3 px-4 rounded-sm font-semibold flex items-center justify-center gap-2 transition-all ${formType === 'EXIT'
                                    ? 'bg-rose-600 text-white shadow-md'
                                    : 'text-slate-500 hover:bg-slate-200'
                                }`}
                        >
                            <PackageMinus size={18} /> Saída/Baixa de Lote
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-2">
                            <label className="saas-label">Selecionar Lote Físico *</label>
                            <select value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })} required className="saas-input">
                                <option value="">Procure por Lote ou Vacina</option>
                                {batches.map((b: any) => (
                                    <option key={b.id} value={b.id}>
                                        (Lote: {b.lotNumber}) {b.vaccine?.name} — {b.quantityAvailable} em estoque
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="saas-label">Quantidade *</label>
                            <div className="relative">
                                <input type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} required className="saas-input font-bold text-lg" />
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 text-sm font-medium">doses</div>
                            </div>
                        </div>
                        <div>
                            <label className="saas-label">Classificação (Motivo) *</label>
                            <select value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="saas-input uppercase text-xs font-bold tracking-wider">
                                {formType === 'ENTRY' ? (
                                    <>
                                        <option value="PURCHASE">Aquisição de Fornecedor</option>
                                        <option value="RETURN">Devolução Comercial</option>
                                        <option value="ADJUSTMENT">Ajuste de Contagem (+)</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="LOSS">Avaria / Quebra</option>
                                        <option value="EXPIRED">Vencimento em Geladeira</option>
                                        <option value="APPLICATION">Uso Extra/Excepcional</option>
                                        <option value="ADJUSTMENT">Ajuste de Contagem (-)</option>
                                    </>
                                )}
                            </select>
                        </div>
                        <div className="md:col-span-2 lg:col-span-4">
                            <label className="saas-label">Justificativa / Observações</label>
                            <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="saas-input" placeholder="Anexar detalhes, nota fiscal ou explicação da perda..." />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
                        <button type="submit" className={`text-white px-8 py-3 rounded-sm font-semibold transition-colors flex items-center gap-2 shadow-sm ${formType === 'ENTRY' ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-600/20' : 'bg-rose-600 hover:bg-rose-700 focus:ring-4 focus:ring-rose-600/20'
                            }`}>
                            <CheckCircle2 size={20} />
                            Confirmar {formType === 'ENTRY' ? 'Entrada' : 'Baixa'} de {form.quantity} Doses
                        </button>
                    </div>
                </form>
            )}

            <div className="saas-card overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 text-sm tracking-tight">
                    Histórico de Movimentações
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Operação</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lote — Vacina</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Motivo</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Volumetria</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Data/Hora</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {movements.map(m => (
                                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`inline-flex flex-col text-center px-3 py-1.5 rounded-sm border ${m.type === 'ENTRY'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-rose-50 text-rose-700 border-rose-200'
                                            }`}>
                                            <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider relative">
                                                {m.type === 'ENTRY' ? (
                                                    <><ArrowDownLeft size={12} strokeWidth={3} /> Entrada</>
                                                ) : (
                                                    <><ArrowUpRight size={12} strokeWidth={3} /> Saída</>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-mono font-semibold text-sm text-slate-800">{m.batch?.lotNumber || 'LOTE DESCONHECIDO'}</div>
                                        <div className="text-xs text-slate-500 truncate max-w-[250px] mt-0.5">{m.batch?.vaccine?.name || 'Vacina Removida'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                        {reasonLabels[m.reason] || m.reason}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className={`font-bold text-lg ${m.type === 'ENTRY' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {m.type === 'ENTRY' ? '+' : '-'}{m.quantity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right font-medium">
                                        {new Date(m.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                </tr>
                            ))}
                            {movements.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        <PackageSearch size={40} className="mx-auto mb-3 opacity-20" />
                                        Nenhuma movimentação de estoque registrada.
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
