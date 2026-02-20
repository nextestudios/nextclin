'use client';

import { useEffect, useState } from 'react';
import { Check, Edit2, X, Save } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminPlansPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPlan, setEditingPlan] = useState<any | null>(null);
    const [saving, setSaving] = useState(false);

    const loadPlans = () => {
        setLoading(true);
        const token = localStorage.getItem('admin_token') || '';
        fetch(`${API}/admin/plans`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(data => { setPlans(Array.isArray(data) ? data : []); })
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadPlans(); }, []);

    const planColors: Record<string, string> = {
        FREE: 'border-gray-700', PRO: 'border-teal-500', ENTERPRISE: 'border-purple-500',
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const token = localStorage.getItem('admin_token') || '';
        const payload = {
            ...editingPlan,
            price: Number(editingPlan.price),
            maxUnits: editingPlan.maxUnits === '' ? null : Number(editingPlan.maxUnits),
            maxProfessionals: editingPlan.maxProfessionals === '' ? null : Number(editingPlan.maxProfessionals),
            maxPatients: editingPlan.maxPatients === '' ? null : Number(editingPlan.maxPatients),
            features: typeof editingPlan.features === 'string'
                ? editingPlan.features.split('\n').map((s: string) => s.trim()).filter(Boolean)
                : editingPlan.features,
        };

        await fetch(`${API}/admin/plans/${editingPlan.plan}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
        });

        setSaving(false);
        setEditingPlan(null);
        loadPlans();
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Planos e Preços</h1>
                <p className="text-sm text-gray-400 mt-1">Gerencie as configurações globais de limites e preços do SaaS</p>
            </div>

            {loading ? (
                <p className="text-sm text-gray-500 text-center py-12">Carregando planos...</p>
            ) : (
                <div className="grid grid-cols-3 gap-6 mb-8">
                    {plans.map(plan => (
                        <div key={plan.plan} className={`bg-gray-900 border-2 ${planColors[plan.plan] || 'border-gray-700'} rounded-xl p-6 relative group`}>
                            <button onClick={() => setEditingPlan({ ...plan, features: (plan.features || []).join('\n') })}
                                className="absolute top-4 right-4 bg-gray-800 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-all">
                                <Edit2 size={14} />
                            </button>
                            <div className="flex items-start justify-between mb-4 mt-2">
                                <div>
                                    <h2 className="font-bold text-white">{plan.name}</h2>
                                    <p className="text-3xl font-bold text-white mt-1">R$ {plan.price}<span className="text-sm text-gray-400">/mês</span></p>
                                </div>
                                <div className="bg-gray-800 rounded-lg px-3 py-1.5 text-center">
                                    <p className="text-2xl font-bold text-white">{plan.activeTenants}</p>
                                    <p className="text-xs text-gray-400">clínicas</p>
                                </div>
                            </div>
                            <div className="space-y-2 mb-5">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Unidades</span>
                                    <span className="text-white">{plan.maxUnits ?? '∞'}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Profissionais</span>
                                    <span className="text-white">{plan.maxProfessionals ?? '∞'}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Pacientes/mês</span>
                                    <span className="text-white">{plan.maxPatients ?? '∞'}</span>
                                </div>
                            </div>
                            <ul className="space-y-1.5">
                                {(plan.features || []).map((f: string) => (
                                    <li key={f} className="flex items-center gap-2 text-xs text-gray-300">
                                        <Check size={12} className="text-teal-400 flex-shrink-0" /> {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {editingPlan && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-white">Editar Plano: {editingPlan.plan}</h2>
                            <button onClick={() => setEditingPlan(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Nome de Exibição</label>
                                    <input value={editingPlan.name} onChange={e => setEditingPlan((p: any) => ({ ...p, name: e.target.value }))}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" required />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Preço (mensal)</label>
                                    <input type="number" step="0.01" value={editingPlan.price} onChange={e => setEditingPlan((p: any) => ({ ...p, price: e.target.value }))}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" required />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Max Unidades</label>
                                    <input type="number" placeholder="Ilimitado = vazio" value={editingPlan.maxUnits} onChange={e => setEditingPlan((p: any) => ({ ...p, maxUnits: e.target.value }))}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Max Profissionais</label>
                                    <input type="number" placeholder="Ilimitado = vazio" value={editingPlan.maxProfessionals} onChange={e => setEditingPlan((p: any) => ({ ...p, maxProfessionals: e.target.value }))}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-gray-400 mb-1 block">Max Pacientes/mês</label>
                                    <input type="number" placeholder="Ilimitado = vazio" value={editingPlan.maxPatients} onChange={e => setEditingPlan((p: any) => ({ ...p, maxPatients: e.target.value }))}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-gray-400 mb-1 block flex justify-between">
                                        <span>Features Inclusas</span>
                                        <span className="text-[10px] text-gray-500">Uma por linha</span>
                                    </label>
                                    <textarea value={editingPlan.features} onChange={e => setEditingPlan((p: any) => ({ ...p, features: e.target.value }))}
                                        rows={6} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-teal-500" />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4 border-t border-gray-800">
                                <button type="submit" disabled={saving} className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                                    <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Plano'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
