'use client';

import { useState, useEffect } from 'react';
import api from '../../../services/api';

interface Professional {
    id: string;
    name: string;
    type: string;
    councilNumber: string;
    phone: string;
    email: string;
    active: boolean;
}

export default function ProfessionalsPage() {
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', type: 'NURSE', councilNumber: '', phone: '', email: '' });

    useEffect(() => { loadProfessionals(); }, []);

    const loadProfessionals = () => {
        api.get('/professionals').then(r => setProfessionals(r.data)).catch(console.error);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await api.post('/professionals', form);
        setForm({ name: '', type: 'NURSE', councilNumber: '', phone: '', email: '' });
        setShowForm(false);
        loadProfessionals();
    };

    const handleDeactivate = async (id: string) => {
        await api.delete(`/professionals/${id}`);
        loadProfessionals();
    };

    const typeLabels: Record<string, string> = {
        DOCTOR: '👨‍⚕️ Médico',
        NURSE: '👩‍⚕️ Enfermeiro(a)',
        TECHNICIAN: '🔧 Técnico(a)',
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Profissionais</h1>
                <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    {showForm ? 'Cancelar' : '+ Novo Profissional'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                                <option value="DOCTOR">Médico</option>
                                <option value="NURSE">Enfermeiro(a)</option>
                                <option value="TECHNICIAN">Técnico(a)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nº Conselho</label>
                            <input value={form.councilNumber} onChange={e => setForm({ ...form, councilNumber: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" placeholder="CRM/COREN" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
                        Salvar Profissional
                    </button>
                </form>
            )}

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Nome</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Tipo</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Conselho</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Contato</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Status</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {professionals.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-8 text-slate-400">Nenhum profissional cadastrado.</td></tr>
                        ) : professionals.map(p => (
                            <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                                <td className="px-4 py-3 text-slate-600">{typeLabels[p.type] || p.type}</td>
                                <td className="px-4 py-3 text-slate-600">{p.councilNumber || '—'}</td>
                                <td className="px-4 py-3 text-slate-600">
                                    {p.phone && <span className="block">{p.phone}</span>}
                                    {p.email && <span className="block text-xs text-slate-400">{p.email}</span>}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-2 py-1 rounded-full ${p.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {p.active ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {p.active && (
                                        <button onClick={() => handleDeactivate(p.id)}
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
