'use client';

import { useEffect, useState } from 'react';
import { Users, Activity, MessageSquare, TrendingUp, Building2, CheckCircle } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function kpi(token: string, path: string) {
    return fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
}

export default function AdminCommandCenter() {
    const [overview, setOverview] = useState<any>(null);
    const [growth, setGrowth] = useState<any[]>([]);
    const [topTenants, setTopTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('admin_token') || '';
        Promise.all([
            kpi(token, '/admin/analytics/overview'),
            kpi(token, '/admin/analytics/growth'),
            kpi(token, '/admin/analytics/top-tenants'),
        ]).then(([ov, gr, top]) => {
            setOverview(ov);
            setGrowth(Array.isArray(gr) ? gr : []);
            setTopTenants(Array.isArray(top) ? top : []);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><p className="text-gray-500 text-sm">Carregando dados globais...</p></div>;

    const cards = [
        { label: 'Total de Clínicas', value: overview?.totalTenants ?? 0, icon: Building2, color: 'teal' },
        { label: 'Atendimentos Hoje', value: overview?.attendancesToday ?? 0, icon: Activity, color: 'blue' },
        { label: 'Mensagens Enviadas Hoje', value: overview?.messagesToday ?? 0, icon: MessageSquare, color: 'purple' },
        { label: 'MRR Estimado', value: `R$ ${(overview?.estimatedMrr ?? 0).toLocaleString('pt-BR')}`, icon: TrendingUp, color: 'green' },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Command Center</h1>
                <p className="text-sm text-gray-400 mt-1">Visão global de todos os tenants</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                {cards.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs text-gray-400">{label}</p>
                            <Icon size={16} className="text-teal-400" />
                        </div>
                        <p className="text-2xl font-bold text-white">{value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Growth Chart */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h2 className="text-sm font-semibold mb-4">Crescimento de Clínicas (12 meses)</h2>
                    {growth.length === 0 ? (
                        <p className="text-gray-500 text-xs text-center py-8">Sem dados ainda</p>
                    ) : (
                        <div className="space-y-2">
                            {growth.map((row, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400 w-16">{row.month}</span>
                                    <div className="flex-1 bg-gray-800 rounded-full h-2">
                                        <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${Math.min((row.newTenants / 10) * 100, 100)}%` }} />
                                    </div>
                                    <span className="text-xs text-gray-300 w-6">{row.newTenants}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Tenants */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h2 className="text-sm font-semibold mb-4">Top 10 Clínicas por Volume</h2>
                    {topTenants.length === 0 ? (
                        <p className="text-gray-500 text-xs text-center py-8">Sem dados ainda</p>
                    ) : (
                        <div className="space-y-2">
                            {topTenants.map((t, i) => (
                                <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 w-4">{i + 1}</span>
                                        <span className="text-xs text-gray-200">{t.tenantName}</span>
                                    </div>
                                    <span className="text-xs text-teal-400 font-medium">{t.total} atend.</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Plans Distribution */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h2 className="text-sm font-semibold mb-4">Distribuição por Plano</h2>
                    <div className="space-y-3">
                        {(overview?.subsByPlan || []).map((p: any) => (
                            <div key={p.s_plan} className="flex items-center justify-between">
                                <span className="text-xs text-gray-300">{p.s_plan}</span>
                                <span className="text-xs font-medium text-white">{p.count} clínicas</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h2 className="text-sm font-semibold mb-4">Status do Sistema</h2>
                    <div className="space-y-3">
                        {['API Backend', 'Banco de Dados', 'Notificações', 'Gateway PIX'].map(s => (
                            <div key={s} className="flex items-center justify-between">
                                <span className="text-xs text-gray-300">{s}</span>
                                <div className="flex items-center gap-1 text-xs text-green-400">
                                    <CheckCircle size={12} /> Operacional
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
