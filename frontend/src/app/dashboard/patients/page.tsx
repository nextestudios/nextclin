'use client';

import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Users, Plus, X, Search, FileText } from 'lucide-react';

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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-teal-100 p-2 rounded-sm text-teal-700">
                        <Users size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pacientes</h1>
                        <p className="text-slate-500 text-sm mt-1">Gestão de prontuários e dados cadastrais</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={showForm ? "saas-button-secondary" : "saas-button-primary"}
                >
                    {showForm ? (
                        <><X size={18} /> Cancelar Cadastro</>
                    ) : (
                        <><Plus size={18} /> Novo Paciente</>
                    )}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="saas-card p-8 bg-white border-t-4 border-t-teal-600">
                    <div className="mb-8 border-b border-slate-100 pb-4">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <Users size={18} className="text-teal-600" />
                            Dados Pessoais
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div>
                            <label className="saas-label">Nome Completo *</label>
                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="saas-input" />
                        </div>
                        <div>
                            <label className="saas-label">CPF</label>
                            <input type="text" value={form.cpf} onChange={e => setForm({ ...form, cpf: e.target.value })} className="saas-input" placeholder="000.000.000-00" />
                        </div>
                        <div>
                            <label className="saas-label">Data de Nascimento</label>
                            <input type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} className="saas-input" />
                        </div>
                        <div>
                            <label className="saas-label">Sexo</label>
                            <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="saas-input">
                                <option value="">Selecione</option>
                                <option value="M">Masculino</option>
                                <option value="F">Feminino</option>
                                <option value="O">Outro</option>
                            </select>
                        </div>
                        <div>
                            <label className="saas-label">Telefone</label>
                            <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="saas-input" placeholder="(00) 00000-0000" />
                        </div>
                        <div>
                            <label className="saas-label">E-mail Corporativo/Pessoal</label>
                            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="saas-input" placeholder="nome@email.com" />
                        </div>
                    </div>

                    <div className="mb-8 border-b border-slate-100 pb-4">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <span className="text-teal-600">📍</span> Endereço
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="md:col-span-2">
                            <label className="saas-label">Endereço Completo</label>
                            <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="saas-input" placeholder="Logradouro, número, bairro" />
                        </div>
                        <div>
                            <label className="saas-label">CEP</label>
                            <input type="text" value={form.zipCode} onChange={e => setForm({ ...form, zipCode: e.target.value })} className="saas-input" placeholder="00000-000" />
                        </div>
                        <div>
                            <label className="saas-label">Cidade</label>
                            <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="saas-input" />
                        </div>
                        <div>
                            <label className="saas-label">Estado (UF)</label>
                            <input type="text" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="saas-input" placeholder="SP" maxLength={2} />
                        </div>
                    </div>

                    <div className="mb-8 border-b border-slate-100 pb-4">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <Users size={18} className="text-teal-600" /> Responsável Legal (Menores)
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div>
                            <label className="saas-label">Nome do Responsável</label>
                            <input type="text" value={form.guardianName} onChange={e => setForm({ ...form, guardianName: e.target.value })} className="saas-input" />
                        </div>
                        <div>
                            <label className="saas-label">CPF do Responsável</label>
                            <input type="text" value={form.guardianCpf} onChange={e => setForm({ ...form, guardianCpf: e.target.value })} className="saas-input" />
                        </div>
                        <div>
                            <label className="saas-label">Telefone do Responsável</label>
                            <input type="text" value={form.guardianPhone} onChange={e => setForm({ ...form, guardianPhone: e.target.value })} className="saas-input" />
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className="saas-label">Observações Clínicas</label>
                        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} className="saas-input resize-none" />
                    </div>

                    <div className="flex justify-end border-t border-slate-100 pt-6">
                        <button type="submit" className="saas-button-primary">
                            <CheckCircle size={18} /> Cadastrar Paciente
                        </button>
                    </div>
                </form>
            )}

            {!showForm && (
                <div className="saas-card overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Buscar por paciente ou CPF..."
                                className="saas-input pl-10 bg-white"
                            />
                        </div>
                        <div className="text-sm text-slate-500 font-medium">
                            {filtered.length} paciente(s) encontrado(s)
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Prontuário</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome do Paciente</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">CPF</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contato</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cidade/UF</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                            <Users size={40} className="mx-auto mb-3 opacity-20" />
                                            Nenhum paciente encontrado com estes filtros.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((p: any) => (
                                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <FileText size={16} className="text-slate-400" />
                                                    <span className="font-mono text-sm font-medium text-slate-600">{p.prontuario || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{p.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{p.cpf || '—'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                <div>{p.phone || '—'}</div>
                                                <div className="text-xs text-slate-400">{p.email || ''}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {p.city ? `${p.city} ${p.state ? '- ' + p.state : ''}` : '—'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

// Temporary import fix for the button icon
import { CheckCircle } from 'lucide-react';
