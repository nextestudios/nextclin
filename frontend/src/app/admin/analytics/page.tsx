'use client';
import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, Activity, DollarSign, Building2 } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminAnalyticsPage() {
    const [overview, setOverview] = useState<any>(null);
    const [growth, setGrowth] = useState<any[]>([]);
    const [topTenants, setTopTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        const headers = { Authorization: `Bearer ${token}` };

        Promise.all([
            fetch(`${API}/admin/analytics/overview`, { headers }).then(r => r.ok ? r.json() : null),
            fetch(`${API}/admin/analytics/growth`, { headers }).then(r => r.ok ? r.json() : null),
            fetch(`${API}/admin/analytics/top-tenants`, { headers }).then(r => r.ok ? r.json() : null),
        ]).then(([ov, gr, tt]) => {
            setOverview(ov);
            setGrowth(gr || []);
            setTopTenants(tt || []);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8"><p className="text-gray-400">Carregando analytics...</p></div>;

    const kpis = [
        { label: 'Total de Clínicas', value: overview?.totalTenants ?? 0, icon: Building2, color: 'text-teal-400', bg: 'bg-teal-400/10' },
        { label: 'Assinaturas Ativas', value: overview?.activeTenants ?? 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Atendimentos Hoje', value: overview?.attendancesToday ?? 0, icon: Activity, color: 'text-green-400', bg: 'bg-green-400/10' },
        { label: 'Mensagens Hoje', value: overview?.messagesToday ?? 0, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { label: 'MRR Estimado', value: `R$ ${(overview?.estimatedMrr ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    ];

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="text-teal-400" /> Analytics</h1>
                <p className="text-gray-400 text-sm mt-1">Métricas detalhadas e tendências da plataforma</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {kpis.map(k => (
                    <div key={k.label} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-gray-400 uppercase tracking-wide">{k.label}</span>
                            <div className={`w-8 h-8 rounded-lg ${k.bg} flex items-center justify-center`}>
                                <k.icon size={16} className={k.color} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold">{k.value}</p>
                    </div>
                ))}
            </div>

            {/* Distribuição por Plano */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <h2 className="text-lg font-semibold mb-4">Distribuição por Plano</h2>
                    {(overview?.subsByPlan || []).length === 0 ? (
                        <p className="text-gray-500 text-sm">Sem dados ainda</p>
                    ) : (
                        <div className="space-y-3">
                            {(overview?.subsByPlan || []).map((s: any) => {
                                const plan = s.s_plan || s.plan || 'N/A';
                                const count = parseInt(s.count) || 0;
                                const total = (overview?.subsByPlan || []).reduce((a: number, b: any) => a + (parseInt(b.count) || 0), 0);
                                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                                const colors: Record<string, string> = { FREE: 'bg-gray-500', PRO: 'bg-teal-500', ENTERPRISE: 'bg-amber-500' };
                                return (
                                    <div key={plan}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium">{plan}</span>
                                            <span className="text-gray-400">{count} clínicas ({pct}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-800 rounded-full h-2">
                                            <div className={`h-2 rounded-full ${colors[plan] || 'bg-teal-500'}`} style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Top Tenants */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <h2 className="text-lg font-semibold mb-4">Top 10 Clínicas por Volume</h2>
                    {topTenants.length === 0 ? (
                        <p className="text-gray-500 text-sm">Sem dados ainda</p>
                    ) : (
                        <div className="space-y-2">
                            {topTenants.map((t, i) => (
                                <div key={t.tenantId} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-teal-600/30 text-teal-400' : 'bg-gray-800 text-gray-400'}`}>{i + 1}</span>
                                        <span className="text-sm font-medium">{t.tenantName}</span>
                                    </div>
                                    <span className="text-sm text-gray-400">{t.total} atendimentos</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Crescimento */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h2 className="text-lg font-semibold mb-4">Crescimento de Clínicas (últimos 12 meses)</h2>
                {growth.length === 0 ? (
                    <p className="text-gray-500 text-sm">Sem dados ainda</p>
                ) : (
                    <div className="flex items-end gap-2 h-48">
                        {growth.map(g => {
                            const max = Math.max(...growth.map(x => parseInt(x.newTenants) || 0), 1);
                            const h = Math.max(((parseInt(g.newTenants) || 0) / max) * 100, 4);
                            return (
                                <div key={g.month} className="flex-1 flex flex-col items-center gap-1">
                                    <span className="text-xs text-gray-400">{parseInt(g.newTenants) || 0}</span>
                                    <div className="w-full bg-teal-600 rounded-t" style={{ height: `${h}%` }} />
                                    <span className="text-xs text-gray-500 mt-1">{g.month?.slice(5)}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <p className="text-xs text-gray-600 text-right">
                Gerado em: {overview?.generatedAt ? new Date(overview.generatedAt).toLocaleString('pt-BR') : '—'}
            </p>
        </div>
    );
}
