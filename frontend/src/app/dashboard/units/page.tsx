'use client';

import { useState, useEffect } from 'react';
import api from '../../../services/api';

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
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Unidades / Clínicas</h1>
                <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    {showForm ? 'Cancelar' : '+ Nova Unidade'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ</label>
                            <input value={form.cnpj} onChange={e => setForm({ ...form, cnpj: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
                            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                            <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">UF</label>
                            <input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} maxLength={2}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" placeholder="SP" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">CEP</label>
                            <input value={form.zipCode} onChange={e => setForm({ ...form, zipCode: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
                        Salvar Unidade
                    </button>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {units.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-400 bg-white rounded-xl shadow">
                        Nenhuma unidade cadastrada.
                    </div>
                ) : units.map(unit => (
                    <div key={unit.id} className="bg-white rounded-xl shadow p-5 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-semibold text-slate-800 text-lg">{unit.name}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${unit.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {unit.active ? 'Ativa' : 'Inativa'}
                            </span>
                        </div>
                        {unit.cnpj && <p className="text-sm text-slate-500">CNPJ: {unit.cnpj}</p>}
                        {unit.address && <p className="text-sm text-slate-500 mt-1">📍 {unit.address}{unit.city ? `, ${unit.city}` : ''}{unit.state ? ` - ${unit.state}` : ''}</p>}
                        {unit.phone && <p className="text-sm text-slate-500 mt-1">📞 {unit.phone}</p>}
                        {unit.email && <p className="text-sm text-slate-500">✉️ {unit.email}</p>}
                        {unit.active && (
                            <button onClick={() => handleDeactivate(unit.id)}
                                className="mt-3 text-red-600 hover:text-red-800 text-sm">Desativar</button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
