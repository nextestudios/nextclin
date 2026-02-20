'use client';

import { useState, useEffect } from 'react';
import api from '../../../services/api';

export default function PatientsPage() {
    const [patients, setPatients] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({
        name: '', cpf: '', birthDate: '', gender: '', phone: '', email: '',
        address: '', city: '', state: '', zipCode: '',
        guardianName: '', guardianCpf: '', guardianPhone: '', notes: '',
    });

    const loadPatients = () => {
        api.get('/patients').then(r => setPatients(r.data)).catch(console.error);
    };
    useEffect(() => { loadPatients(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/patients', form);
            loadPatients();
            setShowForm(false);
            setForm({ name: '', cpf: '', birthDate: '', gender: '', phone: '', email: '', address: '', city: '', state: '', zipCode: '', guardianName: '', guardianCpf: '', guardianPhone: '', notes: '' });
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erro ao cadastrar paciente');
        }
    };

    const filtered = patients.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.cpf?.includes(search)
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Pacientes</h1>
                <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    {showForm ? 'Cancelar' : '+ Novo Paciente'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">Dados Pessoais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                            <input type="text" value={form.cpf} onChange={e => setForm({ ...form, cpf: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" placeholder="000.000.000-00" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Data de Nascimento</label>
                            <input type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Sexo</label>
                            <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black">
                                <option value="">Selecione</option>
                                <option value="M">Masculino</option>
                                <option value="F">Feminino</option>
                                <option value="O">Outro</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                            <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" placeholder="(00) 00000-0000" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" />
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold text-slate-700 mb-4">Endereço</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
                            <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" placeholder="Rua, número, bairro" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">CEP</label>
                            <input type="text" value={form.zipCode} onChange={e => setForm({ ...form, zipCode: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" placeholder="00000-000" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                            <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                            <input type="text" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" placeholder="UF" maxLength={2} />
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold text-slate-700 mb-4">Responsável (menores de idade)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Responsável</label>
                            <input type="text" value={form.guardianName} onChange={e => setForm({ ...form, guardianName: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">CPF do Responsável</label>
                            <input type="text" value={form.guardianCpf} onChange={e => setForm({ ...form, guardianCpf: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Telefone do Responsável</label>
                            <input type="text" value={form.guardianPhone} onChange={e => setForm({ ...form, guardianPhone: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" />
                    </div>

                    <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">Cadastrar Paciente</button>
                </form>
            )}

            <div className="mb-4">
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar por nome ou CPF..."
                    className="w-full md:w-96 border border-slate-300 rounded-lg px-4 py-2 text-black" />
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Prontuário</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Nome</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">CPF</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Telefone</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Email</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Cidade</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((p: any) => (
                            <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                                <td className="px-4 py-3 font-mono text-sm text-slate-500">{p.prontuario || '-'}</td>
                                <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                                <td className="px-4 py-3 text-slate-600">{p.cpf || '-'}</td>
                                <td className="px-4 py-3 text-slate-600">{p.phone || '-'}</td>
                                <td className="px-4 py-3 text-slate-600">{p.email || '-'}</td>
                                <td className="px-4 py-3 text-slate-600">{p.city || '-'}</td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={6} className="text-center py-8 text-slate-400">Nenhum paciente encontrado.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
