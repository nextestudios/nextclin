'use client';

import { useEffect, useState } from 'react';
import { Search, ChevronRight, CheckCircle, XCircle, Plus, X, Save } from 'lucide-react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminTenantsPage() {
    const [tenants, setTenants] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newTenant, setNewTenant] = useState({
        name: '', cnpj: '', plan: 'FREE', adminName: '', adminEmail: '', adminPassword: ''
    });

    const loadTenants = () => {
        setLoading(true);
        const token = localStorage.getItem('admin_token') || '';
        fetch(`${API}/admin/tenants`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(data => { setTenants(Array.isArray(data) ? data : []); })
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadTenants(); }, []);

    const filtered = tenants.filter(t =>
        t.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.cnpj?.includes(search)
    );

    const toggleStatus = async (id: string, active: boolean) => {
        const token = localStorage.getItem('admin_token') || '';
        await fetch(`${API}/admin/tenants/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ active }),
        });
        setTenants(ts => ts.map(t => t.id === id ? { ...t, active } : t));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const token = localStorage.getItem('admin_token') || '';
        await fetch(`${API}/admin/tenants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(newTenant),
        });
        setSaving(false);
        setIsModalOpen(false);
        setNewTenant({ name: '', cnpj: '', plan: 'FREE', adminName: '', adminEmail: '', adminPassword: '' });
        loadTenants();
    };

    const planColor: Record<string, string> = {
        FREE: 'text-gray-400 bg-gray-800', PRO: 'text-teal-400 bg-teal-400/10', ENTERPRISE: 'text-purple-400 bg-purple-400/10',
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Clínicas</h1>
                    <p className="text-sm text-gray-400 mt-1">{tenants.length} clínicas cadastradas</p>
                </div>
                <button onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <Plus size={16} /> Nova Clínica
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar por nome ou CNPJ..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors" />
            </div>

            {loading ? (
                <p className="text-sm text-gray-500 text-center py-12">Carregando clínicas...</p>
            ) : (
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Clínica</th>
                                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">CNPJ</th>
                                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Plano</th>
                                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Usuários</th>
                                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Status</th>
                                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(t => (
                                <tr key={t.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="text-white font-medium text-xs">{t.name}</p>
                                        <p className="text-gray-500 text-xs">{t.slug}</p>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-400">{t.cnpj || '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${planColor[t.plan] || 'text-gray-400 bg-gray-800'}`}>
                                            {t.plan}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-400">{t.userCount}</td>
                                    <td className="px-4 py-3">
                                        {t.active !== false
                                            ? <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle size={12} /> Ativa</span>
                                            : <span className="flex items-center gap-1 text-xs text-red-400"><XCircle size={12} /> Suspensa</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => toggleStatus(t.id, !t.active)}
                                                className="text-xs text-gray-400 hover:text-teal-400 transition-colors">
                                                {t.active !== false ? 'Suspender' : 'Ativar'}
                                            </button>
                                            <Link href={`/admin/tenants/${t.id}`}
                                                className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-0.5">
                                                Ver <ChevronRight size={10} />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && !loading && (
                        <p className="text-xs text-gray-500 text-center py-8">Nenhuma clínica encontrada.</p>
                    )}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-white">Cadastrar Nova Clínica</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-xs text-gray-400 mb-1 block">Nome da Clínica</label>
                                    <input value={newTenant.name} onChange={e => setNewTenant(t => ({ ...t, name: e.target.value }))}
                                        placeholder="Minha Clínica LTDA" required
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500" />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-xs text-gray-400 mb-1 block">CNPJ (Opcional)</label>
                                    <input value={newTenant.cnpj} onChange={e => setNewTenant(t => ({ ...t, cnpj: e.target.value }))}
                                        placeholder="00.000.000/0001-00"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-gray-400 mb-1 block">Plano Inicial</label>
                                    <select value={newTenant.plan} onChange={e => setNewTenant(t => ({ ...t, plan: e.target.value }))}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500">
                                        <option value="FREE">Gratuito</option>
                                        <option value="PRO">Profissional</option>
                                        <option value="ENTERPRISE">Enterprise</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-800">
                                <h3 className="text-sm font-semibold text-white mb-4">Usuário Administrador (Dono)</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="text-xs text-gray-400 mb-1 block">Nome do Admin</label>
                                        <input value={newTenant.adminName} onChange={e => setNewTenant(t => ({ ...t, adminName: e.target.value }))}
                                            placeholder="Nome completo" required
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500" />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="text-xs text-gray-400 mb-1 block">E-mail do Admin</label>
                                        <input type="email" value={newTenant.adminEmail} onChange={e => setNewTenant(t => ({ ...t, adminEmail: e.target.value }))}
                                            placeholder="admin@clinica.com" required
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs text-gray-400 mb-1 block">Senha Inicial</label>
                                        <input type="password" value={newTenant.adminPassword} onChange={e => setNewTenant(t => ({ ...t, adminPassword: e.target.value }))}
                                            placeholder="••••••••" required
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-800">
                                <button type="submit" disabled={saving} className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                                    <Save size={16} /> {saving ? 'Salvando...' : 'Cadastrar Clínica'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
