'use client';

import { useEffect, useState } from 'react';
import api from '../../../services/api';

interface Patient {
    id: string;
    prontuario: string;
    name: string;
    cpf: string;
    phone: string;
    email: string;
    birthDate: string;
}

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', cpf: '', phone: '', email: '', birthDate: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPatients();
    }, [search]);

    async function loadPatients() {
        try {
            const res = await api.get('/patients', { params: { search } });
            setPatients(res.data);
        } catch { }
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            await api.post('/patients', form);
            setShowForm(false);
            setForm({ name: '', cpf: '', phone: '', email: '', birthDate: '' });
            loadPatients();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erro ao cadastrar paciente.');
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">👤 Pacientes</h1>
                    <p className="text-slate-500 text-sm">Gerencie o cadastro de pacientes</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                    + Novo Paciente
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Cadastrar Paciente</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <input type="text" placeholder="Nome completo *" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="px-4 py-2.5 border border-slate-200 rounded-lg text-black placeholder-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" />
                        <input type="text" placeholder="CPF" value={form.cpf} onChange={e => setForm({ ...form, cpf: e.target.value })} className="px-4 py-2.5 border border-slate-200 rounded-lg text-black placeholder-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" />
                        <input type="text" placeholder="Telefone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="px-4 py-2.5 border border-slate-200 rounded-lg text-black placeholder-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" />
                        <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="px-4 py-2.5 border border-slate-200 rounded-lg text-black placeholder-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" />
                        <input type="date" placeholder="Data de Nascimento" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} className="px-4 py-2.5 border border-slate-200 rounded-lg text-black placeholder-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" />
                        <div className="flex gap-2">
                            <button type="submit" className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">Salvar</button>
                            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors">Cancelar</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-4 border-b border-slate-100">
                    <input
                        type="text"
                        placeholder="🔍 Buscar por nome, CPF ou prontuário..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-black placeholder-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Prontuário</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">CPF</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Telefone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {patients.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                                    <td className="px-6 py-4 text-sm font-mono text-blue-600">{p.prontuario}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{p.name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{p.cpf || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{p.phone || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{p.email || '-'}</td>
                                </tr>
                            ))}
                            {patients.length === 0 && !loading && (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Nenhum paciente encontrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
