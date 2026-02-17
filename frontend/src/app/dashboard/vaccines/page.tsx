'use client';

import { useEffect, useState } from 'react';
import api from '../../../services/api';

interface Vaccine { id: string; name: string; manufacturer: string; totalDoses: number; salePrice: number; batches: any[] }

export default function VaccinesPage() {
    const [vaccines, setVaccines] = useState<Vaccine[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', manufacturer: '', totalDoses: 1, doseIntervalDays: 0, costPrice: 0, salePrice: 0 });

    useEffect(() => { loadVaccines(); }, []);

    async function loadVaccines() {
        try { const res = await api.get('/vaccines'); setVaccines(res.data); } catch { }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try { await api.post('/vaccines', form); setShowForm(false); loadVaccines(); }
        catch (err: any) { alert(err.response?.data?.message || 'Erro'); }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">💉 Vacinas</h1>
                    <p className="text-slate-500 text-sm">Catálogo de vacinas</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm">+ Nova Vacina</button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" placeholder="Nome *" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="px-4 py-2.5 border border-slate-200 rounded-lg text-black placeholder-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" />
                        <input type="text" placeholder="Fabricante" value={form.manufacturer} onChange={e => setForm({ ...form, manufacturer: e.target.value })} className="px-4 py-2.5 border border-slate-200 rounded-lg text-black placeholder-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" />
                        <input type="number" placeholder="Total de Doses" value={form.totalDoses} onChange={e => setForm({ ...form, totalDoses: +e.target.value })} className="px-4 py-2.5 border border-slate-200 rounded-lg text-black placeholder-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" />
                        <input type="number" placeholder="Intervalo (dias)" value={form.doseIntervalDays} onChange={e => setForm({ ...form, doseIntervalDays: +e.target.value })} className="px-4 py-2.5 border border-slate-200 rounded-lg text-black placeholder-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" />
                        <input type="number" step="0.01" placeholder="Preço Custo" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: +e.target.value })} className="px-4 py-2.5 border border-slate-200 rounded-lg text-black placeholder-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" />
                        <input type="number" step="0.01" placeholder="Preço Venda" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: +e.target.value })} className="px-4 py-2.5 border border-slate-200 rounded-lg text-black placeholder-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" />
                        <div className="flex gap-2">
                            <button type="submit" className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg">Salvar</button>
                            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-slate-200 text-slate-700 rounded-lg">Cancelar</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vaccines.map(v => (
                    <div key={v.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                        <h3 className="font-semibold text-slate-800">{v.name}</h3>
                        <p className="text-sm text-slate-400">{v.manufacturer}</p>
                        <div className="mt-3 flex justify-between text-sm">
                            <span className="text-slate-500">{v.totalDoses} dose(s)</span>
                            <span className="font-medium text-emerald-600">R$ {Number(v.salePrice).toFixed(2)}</span>
                        </div>
                        <div className="mt-2 text-xs text-slate-400">
                            {v.batches?.length || 0} lotes em estoque
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
