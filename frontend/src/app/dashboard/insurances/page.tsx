'use client';

import { useState, useEffect } from 'react';
import api from '../../../services/api';

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
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Convênios / Operadoras</h1>
                <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    {showForm ? 'Cancelar' : '+ Novo Convênio'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Unimed, SulAmérica..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Código ANS</label>
                            <input value={form.ansCode} onChange={e => setForm({ ...form, ansCode: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" placeholder="000000" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Desconto (%)</label>
                            <input type="number" min="0" max="100" step="0.5" value={form.discountPercent}
                                onChange={e => setForm({ ...form, discountPercent: Number(e.target.value) })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
                        Salvar Convênio
                    </button>
                </form>
            )}

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Nome</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Código ANS</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Desconto</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Status</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {insurances.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-8 text-slate-400">Nenhum convênio cadastrado.</td></tr>
                        ) : insurances.map(ins => (
                            <tr key={ins.id} className="border-t border-slate-100 hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-slate-800">{ins.name}</td>
                                <td className="px-4 py-3 text-slate-600">{ins.ansCode || '—'}</td>
                                <td className="px-4 py-3 text-slate-600">{ins.discountPercent}%</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-2 py-1 rounded-full ${ins.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {ins.active ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {ins.active && (
                                        <button onClick={() => handleDeactivate(ins.id)}
                                            className="text-red-600 hover:text-red-800 text-sm">Desativar</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
