'use client';

import { useState, useEffect } from 'react';
import api from '../../../services/api';
import {
    Building2, Plus, X, MapPin,
    Phone, Mail, CheckCircle2, Factory, PowerOff
} from 'lucide-react';

interface Unit {
    id: string;
    name: string;
    cnpj: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    active: boolean;
}

export default function UnitsPage() {
    const [units, setUnits] = useState<Unit[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', cnpj: '', phone: '', email: '', address: '', city: '', state: '', zipCode: '' });

    useEffect(() => { loadUnits(); }, []);

    const loadUnits = () => {
        api.get('/units').then(r => setUnits(r.data)).catch(console.error);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await api.post('/units', form);
        setForm({ name: '', cnpj: '', phone: '', email: '', address: '', city: '', state: '', zipCode: '' });
        setShowForm(false);
        loadUnits();
    };

    const handleDeactivate = async (id: string) => {
        await api.delete(`/units/${id}`);
        loadUnits();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 saas-card">
                <div className="flex items-center gap-3">
                    <div className="bg-teal-100 p-2 text-teal-700 rounded-sm">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Unidades e Polos de Atendimento</h1>
                        <p className="text-slate-500 text-sm mt-1">Gestão de filiais físicas cadastráveis e CNPJs associados</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={showForm ? "saas-button-secondary" : "saas-button-primary"}
                >
                    {showForm ? <><X size={18} /> Cancelar Abertura</> : <><Plus size={18} /> Abrir Nova Filial</>}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="saas-card p-8 bg-white border-t-4 border-t-teal-600">
                    <div className="mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
                        <Factory size={20} className="text-teal-600" />
                        <h3 className="text-lg font-semibold text-slate-800">Alvará Comercial e Endereçamento</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-2">
                            <label className="saas-label">Razão Social / Nome da Matriz *</label>
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="saas-input" placeholder="Matriz SP Prime..." />
                        </div>
                        <div className="md:col-span-2">
                            <label className="saas-label">CNPJ (Registro Autárquico)</label>
                            <input value={form.cnpj} onChange={e => setForm({ ...form, cnpj: e.target.value })} className="saas-input font-mono" placeholder="00.000.000/0000-00" />
                        </div>

                        <div className="md:col-span-4 mt-2">
                            <label className="saas-label text-teal-700 font-semibold border-b border-slate-100 pb-1 mb-3 block">Dados de Comunicação & Localidade</label>
                        </div>

                        <div className="md:col-span-2">
                            <label className="saas-label">PABX / Telefone Receptor</label>
                            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="saas-input" placeholder="(00) 0000-0000" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="saas-label">SAC / E-mail Setorial</label>
                            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="saas-input" placeholder="unidade@clinica.com.br" />
                        </div>
                        <div className="md:col-span-4">
                            <label className="saas-label">Endereço Cartográfico Fiscal</label>
                            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="saas-input" placeholder="Av Paulista, 1000 - Bela Vista" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="saas-label">Logradouro Cidades Unificadas</label>
                            <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="saas-input" placeholder="São Paulo" />
                        </div>
                        <div>
                            <label className="saas-label">UF</label>
                            <input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} maxLength={2} className="saas-input uppercase" placeholder="SP" />
                        </div>
                        <div>
                            <label className="saas-label">Zoneamento (CEP)</label>
                            <input value={form.zipCode} onChange={e => setForm({ ...form, zipCode: e.target.value })} className="saas-input font-mono" placeholder="00000-000" />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
                        <button type="submit" className="saas-button-primary">
                            <CheckCircle2 size={18} /> Cadastrar Filial Autorizada
                        </button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {units.length === 0 && !showForm && (
                    <div className="col-span-full saas-card p-16 text-center flex flex-col items-center justify-center text-slate-400">
                        <Building2 size={48} className="opacity-20 mb-4" />
                        <p className="font-medium text-lg text-slate-500">Nenhum Polo Ativo Encontrado.</p>
                        <p className="text-sm mt-1">Configure o primeiro Headquarter ou Polo Administrativo usando "Abrir Nova Filial".</p>
                    </div>
                )}
                {units.map(unit => (
                    <div key={unit.id} className="saas-card overflow-hidden flex flex-col bg-white">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg tracking-tight mb-2 pr-2">{unit.name}</h3>
                                {unit.cnpj ? (
                                    <span className="font-mono text-xs bg-white px-2 py-1 rounded-sm border border-slate-200 text-slate-600 block w-max font-semibold tracking-wider">
                                        CNPJ: {unit.cnpj}
                                    </span>
                                ) : (
                                    <span className="font-mono text-[10px] bg-amber-50 px-2 py-1 rounded-sm border border-amber-200 text-amber-700 block w-max font-bold tracking-widest uppercase">
                                        Freesale / Sem Matrícula Fiscal
                                    </span>
                                )}
                            </div>
                            <span className={`flex-shrink-0 text-[10px] uppercase font-bold tracking-wider px-2 py-1.5 rounded-sm border ${unit.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm' : 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm'}`}>
                                {unit.active ? 'Polo Ativo' : 'Polo Fechado'}
                            </span>
                        </div>

                        <div className="p-5 flex-1 flex flex-col gap-3">
                            {unit.address && (
                                <div className="flex items-start gap-2.5">
                                    <MapPin size={16} className="text-teal-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-slate-600 leading-tight">
                                        {unit.address}
                                        {(unit.city || unit.state) && <span className="block mt-0.5 font-medium text-slate-800">{unit.city}{unit.city && unit.state && ', '}{unit.state}</span>}
                                    </p>
                                </div>
                            )}

                            {(unit.phone || unit.email) && <hr className="border-slate-100 my-1" />}

                            {unit.phone && (
                                <div className="flex items-center gap-2.5 text-sm">
                                    <Phone size={14} className="text-slate-400" />
                                    <span className="text-slate-700 font-medium">{unit.phone}</span>
                                </div>
                            )}

                            {unit.email && (
                                <div className="flex items-center gap-2.5 text-sm">
                                    <Mail size={14} className="text-slate-400" />
                                    <span className="text-slate-600 truncate">{unit.email}</span>
                                </div>
                            )}
                        </div>

                        {unit.active && (
                            <div className="px-5 py-4 border-t border-slate-50 bg-slate-50/50 flex justify-end">
                                <button onClick={() => handleDeactivate(unit.id)} className="text-xs uppercase font-bold tracking-wider text-rose-600 hover:text-rose-800 flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                                    <PowerOff size={14} /> Encerrar Atividades
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
