'use client';

import { useState, useEffect } from 'react';
import api from '../../../services/api';
import {
    Users, Plus, X, Stethoscope,
    BriefcaseMedical, Settings2, Mail, Phone,
    ShieldBan, CheckCircle2, Edit
} from 'lucide-react';

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
    const [editingId, setEditingId] = useState<string | null>(null);
    const emptyForm = { name: '', type: 'NURSE', councilNumber: '', phone: '', email: '' };
    const [form, setForm] = useState(emptyForm);

    useEffect(() => { loadProfessionals(); }, []);

    const loadProfessionals = () => {
        api.get('/professionals').then(r => setProfessionals(r.data)).catch(console.error);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            await api.put(`/professionals/${editingId}`, form);
        } else {
            await api.post('/professionals', form);
        }
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(false);
        loadProfessionals();
    };

    const startEdit = (p: Professional) => {
        setEditingId(p.id);
        setForm({ name: p.name, type: p.type, councilNumber: p.councilNumber || '', phone: p.phone || '', email: p.email || '' });
        setShowForm(true);
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
    };

    const handleDeactivate = async (id: string) => {
        await api.delete(`/professionals/${id}`);
        loadProfessionals();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 saas-card">
                <div className="flex items-center gap-3">
                    <div className="bg-teal-100 p-2 text-teal-700 rounded-sm">
                        <Users size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Equipe Clínica & Profissionais</h1>
                        <p className="text-slate-500 text-sm mt-1">Gestão de médicos, enfermeiros e técnicos vinculados à instituição</p>
                    </div>
                </div>
                <button
                    onClick={() => showForm ? cancelForm() : setShowForm(true)}
                    className={showForm ? "saas-button-secondary" : "saas-button-primary"}
                >
                    {showForm ? <><X size={18} /> Cancelar</> : <><Plus size={18} /> Cadastrar Profissional</>}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className={`saas-card p-8 bg-white border-t-4 ${editingId ? 'border-t-amber-500' : 'border-t-teal-600'}`}>
                    <h3 className="text-lg font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">
                        {editingId ? '✏️ Editar Profissional' : 'Perfil do Colaborador'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="saas-label">Nome Completo (Identidade Civil) *</label>
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="saas-input" placeholder="Ex: Dra. Ana Silva" />
                        </div>
                        <div>
                            <label className="saas-label">Atribuição / Cargo Técnico *</label>
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="saas-input">
                                <option value="DOCTOR">Médico(a) Especialista</option>
                                <option value="NURSE">Enfermeiro(a) Padrão</option>
                                <option value="TECHNICIAN">Técnico(a) em Enfermagem</option>
                            </select>
                        </div>
                        <div>
                            <label className="saas-label">Registro do Conselho de Classe (CRM/COREN)</label>
                            <input value={form.councilNumber} onChange={e => setForm({ ...form, councilNumber: e.target.value })} className="saas-input font-mono uppercase" placeholder="UF-000000" />
                        </div>
                        <div>
                            <label className="saas-label">Telefone Corporativo / Plantão</label>
                            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="saas-input" placeholder="(00) 00000-0000" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="saas-label">E-mail Institucional</label>
                            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="saas-input" placeholder="nome@clinica.com.br" />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
                        <button type="submit" className={editingId ? 'saas-button-primary bg-amber-600 hover:bg-amber-700' : 'saas-button-primary'}>
                            <CheckCircle2 size={18} /> {editingId ? 'Salvar Alterações' : 'Efetivar Registro'}
                        </button>
                    </div>
                </form>
            )}

            <div className="saas-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Identidade Profissional</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cargo Técnico</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Número Conselho</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Meios de Contato</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Governança</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {professionals.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-16 text-center text-slate-400">
                                        <Users size={48} className="mx-auto mb-4 opacity-20" />
                                        <p className="font-medium text-lg text-slate-500">O quadro de profissionais clínicos está vazio.</p>
                                    </td>
                                </tr>
                            ) : professionals.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-sm bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                                {p.type === 'DOCTOR' ? <Stethoscope size={20} /> : p.type === 'NURSE' ? <BriefcaseMedical size={20} /> : <Settings2 size={20} />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{p.name}</div>
                                                <span className={`text-[10px] mt-1 uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm border ${p.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                                    {p.active ? 'Ativo no Sistema' : 'Vínculo Encerrado'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                                        {p.type === 'DOCTOR' ? 'Médico(a)' : p.type === 'NURSE' ? 'Enfermeiro(a)' : 'Técnico(a)'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {p.councilNumber ? (
                                            <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded-sm border border-slate-200 text-slate-700">{p.councilNumber}</span>
                                        ) : <span className="text-slate-400">—</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {p.phone && <div className="flex items-center gap-1.5 text-sm text-slate-600 mb-1"><Phone size={14} className="opacity-50" /> {p.phone}</div>}
                                        {p.email && <div className="flex items-center gap-1.5 text-xs text-slate-500"><Mail size={12} className="opacity-50" /> {p.email}</div>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center gap-2 justify-end">
                                            <button
                                                onClick={() => startEdit(p)}
                                                className="text-[11px] font-bold tracking-wider uppercase bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-sm hover:border-teal-500 hover:text-teal-700 hover:bg-teal-50 transition-colors flex items-center gap-1.5 opacity-0 group-hover:opacity-100 shadow-sm"
                                            >
                                                <Edit size={14} /> Editar
                                            </button>
                                            {p.active ? (
                                                <button
                                                    onClick={() => handleDeactivate(p.id)}
                                                    className="text-[11px] font-bold tracking-wider uppercase bg-white border border-rose-200 text-rose-600 px-3 py-1.5 rounded-sm hover:border-rose-500 hover:text-rose-800 hover:bg-rose-50 transition-colors flex items-center gap-1.5 opacity-0 group-hover:opacity-100 shadow-sm"
                                                >
                                                    <ShieldBan size={14} /> Revogar
                                                </button>
                                            ) : (
                                                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">Revogado</span>
                                            )}
                                        </div>
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
