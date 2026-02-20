'use client';

import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { ShieldCheck, Plus, X, Handshake, ShieldBan, CheckCircle2 } from 'lucide-react';

interface Insurance {
    id: string;
    name: string;
    ansCode: string;
    discountPercent: number;
    active: boolean;
}

export default function InsurancesPage() {
    const [insurances, setInsurances] = useState<Insurance[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', ansCode: '', discountPercent: 0 });

    useEffect(() => { loadInsurances(); }, []);

    const loadInsurances = () => {
        api.get('/insurances').then(r => setInsurances(r.data)).catch(console.error);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await api.post('/insurances', form);
        setForm({ name: '', ansCode: '', discountPercent: 0 });
        setShowForm(false);
        loadInsurances();
    };

    const handleDeactivate = async (id: string) => {
        await api.delete(`/insurances/${id}`);
        loadInsurances();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 saas-card">
                <div className="flex items-center gap-3">
                    <div className="bg-teal-100 p-2 text-teal-700 rounded-sm">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Operadoras & Convênios de Saúde</h1>
                        <p className="text-slate-500 text-sm mt-1">Gestão de carteira credenciada e regras de precificação ANS</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={showForm ? "saas-button-secondary" : "saas-button-primary"}
                >
                    {showForm ? <><X size={18} /> Cancelar Cadastro</> : <><Plus size={18} /> Homologar Convênio</>}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="saas-card p-8 bg-white border-t-4 border-t-teal-600">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
                        <Handshake size={20} className="text-teal-600" />
                        Nova Entidade Parceira
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <label className="saas-label">Razão Social / Nome Fantasia *</label>
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="saas-input" placeholder="Ex: SulAmérica Saúde, Bradesco Saúde..." />
                        </div>
                        <div>
                            <label className="saas-label">Registro Agência Nac. (ANS)</label>
                            <input value={form.ansCode} onChange={e => setForm({ ...form, ansCode: e.target.value })} className="saas-input font-mono" placeholder="000000" />
                        </div>
                        <div>
                            <label className="saas-label">Markup / Desconto Pactuado (%)</label>
                            <div className="relative">
                                <input type="number" min="0" max="100" step="0.5" value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: Number(e.target.value) })} className="saas-input font-bold" />
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">%</div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
                        <button type="submit" className="saas-button-primary">
                            <CheckCircle2 size={18} /> Homologar Parceiro
                        </button>
                    </div>
                </form>
            )}

            <div className="saas-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Identidade da Operadora</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Normativa ANS</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acordo Financeiro</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Contrato Ativo</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Descredenciamento</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {insurances.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-16 text-center text-slate-400">
                                        <ShieldCheck size={48} className="mx-auto mb-4 opacity-20" />
                                        <p className="font-medium text-lg text-slate-500">Nenhuma operadora ou convênio homologado.</p>
                                    </td>
                                </tr>
                            ) : insurances.map(ins => (
                                <tr key={ins.id} className="hover:bg-slate-50/70 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-bold text-slate-900 text-base">{ins.name}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {ins.ansCode ? (
                                            <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded-sm border border-slate-200 text-slate-700 tracking-wider font-semibold">
                                                ANS - {ins.ansCode}
                                            </span>
                                        ) : <span className="text-slate-400">—</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className="font-black text-emerald-600 tracking-tight text-lg">{ins.discountPercent}%</span>
                                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold mt-0.5">Off Tabela Particular</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1.5 rounded-sm border ${ins.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                            {ins.active ? 'Vigente' : 'Descredenciado'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right flex justify-end">
                                        {ins.active ? (
                                            <button
                                                onClick={() => handleDeactivate(ins.id)}
                                                className="text-[11px] font-bold tracking-wider uppercase bg-white border border-rose-200 text-rose-600 px-3 py-1.5 rounded-sm hover:border-rose-500 hover:text-rose-800 hover:bg-rose-50 transition-colors flex items-center gap-1.5 opacity-0 group-hover:opacity-100 shadow-sm"
                                            >
                                                <ShieldBan size={14} /> Suspender
                                            </button>
                                        ) : (
                                            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 mr-2">Sem Cobertura</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
