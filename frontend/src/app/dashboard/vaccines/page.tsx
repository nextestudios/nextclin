'use client';

import { useEffect, useState } from 'react';
import api from '../../../services/api';
import { Syringe, Plus, X, CheckCircle2, Box, Info, Trash2, Edit } from 'lucide-react';

interface Vaccine { id: string; name: string; manufacturer: string; totalDoses: number; salePrice: number; batches: any[] }

export default function VaccinesPage() {
    const [vaccines, setVaccines] = useState<Vaccine[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const emptyForm = { name: '', manufacturer: '', totalDoses: 1, doseIntervalDays: 0, costPrice: 0, salePrice: 0 };
    const [form, setForm] = useState(emptyForm);

    useEffect(() => { loadVaccines(); }, []);

    async function loadVaccines() {
        try { const res = await api.get('/vaccines'); setVaccines(res.data); } catch { }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/vaccines/${editingId}`, form);
            } else {
                await api.post('/vaccines', form);
            }
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(false);
            loadVaccines();
        } catch (err: any) { alert(err.response?.data?.message || 'Erro'); }
    }

    function startEdit(v: Vaccine) {
        setEditingId(v.id);
        setForm({ name: v.name, manufacturer: v.manufacturer || '', totalDoses: v.totalDoses || 1, doseIntervalDays: 0, costPrice: 0, salePrice: v.salePrice || 0 });
        setShowForm(true);
    }

    function cancelForm() {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 saas-card">
                <div className="flex items-center gap-3">
                    <div className="bg-teal-100 p-2 text-teal-700 rounded-sm">
                        <Syringe size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Catálogo de Vacinas</h1>
                        <p className="text-slate-500 text-sm mt-1">Gerenciamento de tipos de imunizantes e preços essenciais</p>
                    </div>
                </div>
                <button
                    onClick={() => showForm ? cancelForm() : setShowForm(true)}
                    className={showForm ? "saas-button-secondary" : "saas-button-primary"}
                >
                    {showForm ? <><X size={18} /> Fechar</> : <><Plus size={18} /> Cadastrar Nova Vacina</>}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className={`saas-card p-8 bg-white border-t-4 ${editingId ? 'border-t-amber-500' : 'border-t-teal-600'}`}>
                    <h3 className="text-lg font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">{editingId ? '✏️ Editar Vacina' : 'Dados do Imunizante'}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <label className="saas-label">Nome da Vacina *</label>
                            <input type="text" placeholder="Ex: Hexavalente Acelular" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="saas-input" />
                        </div>
                        <div>
                            <label className="saas-label">Fabricante/Laboratório</label>
                            <input type="text" placeholder="Ex: Sanofi Pasteur" value={form.manufacturer} onChange={e => setForm({ ...form, manufacturer: e.target.value })} className="saas-input" />
                        </div>
                        <div>
                            <label className="saas-label">Total de Doses no Esquema</label>
                            <input type="number" min="1" value={form.totalDoses} onChange={e => setForm({ ...form, totalDoses: +e.target.value })} className="saas-input" />
                        </div>
                        <div className="relative group">
                            <label className="saas-label flex items-center gap-1">
                                Intervalo entre Doses (Dias)
                                <Info size={14} className="text-slate-400" />
                            </label>
                            <input type="number" min="0" value={form.doseIntervalDays} onChange={e => setForm({ ...form, doseIntervalDays: +e.target.value })} className="saas-input" />
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden group-hover:block bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg -mt-10 max-w-[200px]">
                                Útil para disparar lembretes da 2ª dose em diante.
                            </div>
                        </div>
                        <div>
                            <label className="saas-label text-slate-500">Preço de Custo (R$)</label>
                            <input type="number" step="0.01" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: +e.target.value })} className="saas-input" />
                        </div>
                        <div>
                            <label className="saas-label font-bold text-teal-700">Preço Base de Venda (R$)</label>
                            <input type="number" step="0.01" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: +e.target.value })} className="saas-input border-teal-200 focus:ring-teal-500 bg-teal-50/30" />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end border-t border-slate-100 pt-6 gap-3">
                        <button type="button" onClick={() => cancelForm()} className="saas-button-secondary">Cancelar</button>
                        <button type="submit" className={editingId ? 'saas-button-primary bg-amber-600 hover:bg-amber-700' : 'saas-button-primary'}>
                            <CheckCircle2 size={18} /> {editingId ? 'Salvar Alterações' : 'Salvar no Catálogo'}
                        </button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {vaccines.length === 0 && !showForm && (
                    <div className="col-span-full saas-card p-12 text-center flex flex-col items-center justify-center text-slate-400">
                        <Syringe size={48} className="opacity-20 mb-4" />
                        <p className="font-medium text-lg text-slate-500">Nenhuma vacina cadastrada no portfólio.</p>
                        <p className="text-sm mt-1">Clique em "Nova Vacina" para adicionar o primeiro imunizante.</p>
                    </div>
                )}
                {vaccines.map(v => (
                    <div key={v.id} className="saas-card p-0 flex flex-col group overflow-hidden bg-white hover:border-teal-300 transition-colors">
                        <div className="p-5 flex-1 relative">
                            <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1 pr-6">{v.name}</h3>
                            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">{v.manufacturer || 'Fabricante Não Informado'}</p>

                            <div className="absolute top-5 right-5 text-teal-100 group-hover:text-teal-500 transition-colors">
                                <Syringe size={20} />
                            </div>
                        </div>

                        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Preço (Dose Base)</span>
                                <span className="font-bold text-emerald-600 text-lg">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v.salePrice) || 0)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-sm bg-slate-200 text-slate-600">
                                    <Box size={12} />
                                    {v.batches?.length || 0} lote(s) ativo(s)
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-xs font-medium text-slate-500">
                                        Esquema: {v.totalDoses} dose(s)
                                    </div>
                                    <button
                                        onClick={() => startEdit(v)}
                                        className="p-1.5 text-teal-500 hover:bg-teal-50 rounded-sm transition-colors opacity-0 group-hover:opacity-100"
                                        title="Editar"
                                    >
                                        <Edit size={14} />
                                    </button>
                                    <button
                                        onClick={async () => { if (confirm(`Remover vacina "${v.name}"?`)) { await api.delete(`/vaccines/${v.id}`); loadVaccines(); } }}
                                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-sm transition-colors opacity-0 group-hover:opacity-100"
                                        title="Excluir"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
