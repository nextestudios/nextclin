'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminPlansPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('admin_token') || '';
        fetch(`${API}/admin/plans`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(data => { setPlans(Array.isArray(data) ? data : []); })
            .finally(() => setLoading(false));
    }, []);

    const planColors: Record<string, string> = {
        FREE: 'border-gray-700', PRO: 'border-teal-500', ENTERPRISE: 'border-purple-500',
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Planos e Preços</h1>
                <p className="text-sm text-gray-400 mt-1">Gerencie os planos do SaaS e os tenants associados</p>
            </div>

            {loading ? (
                <p className="text-sm text-gray-500 text-center py-12">Carregando planos...</p>
            ) : (
                <div className="grid grid-cols-3 gap-6 mb-8">
                    {plans.map(plan => (
                        <div key={plan.plan} className={`bg-gray-900 border-2 ${planColors[plan.plan] || 'border-gray-700'} rounded-xl p-6`}>
                            <div className="flex items-start justify-between mb-4">
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

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-sm font-semibold mb-1">Override de Plano por Tenant</h2>
                <p className="text-xs text-gray-400 mb-4">Use o endpoint <code className="bg-gray-800 px-1 py-0.5 rounded text-teal-400">PATCH /admin/plans/&#123;tenantId&#125;/override</code> para alterar o plano de uma clínica específica.</p>
                <p className="text-xs text-gray-500">Acesse a página de uma clínica em <strong className="text-gray-300">/admin/tenants</strong> e use o botão de Alterar Plano.</p>
            </div>
        </div>
    );
}
