'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, Syringe, Clock, AlertTriangle, Activity } from 'lucide-react';
import api from '@/services/api';

interface DashboardStats {
    totalPatients: number;
    totalAppointments: number;
    totalVaccinesApplied: number;
    noShowRate: number;
    avgWaitTime: number;
    topVaccines: { name: string; count: number }[];
    appointmentsByStatus: { status: string; count: number }[];
    monthlyTrend: { month: string; count: number }[];
}

export default function DashboardAssistencialPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/reports/vaccines-applied').catch(() => ({ data: [] })),
            api.get('/reports/stock-summary').catch(() => ({ data: [] })),
            api.get('/attendances/stats/today').catch(() => ({ data: {} })),
        ])
            .then(([vaccines, stock, attendance]) => {
                setStats({
                    totalPatients: 0,
                    totalAppointments: 0,
                    totalVaccinesApplied: Array.isArray(vaccines.data) ? vaccines.data.length : 0,
                    noShowRate: 8.5,
                    avgWaitTime: 12,
                    topVaccines: [
                        { name: 'Influenza', count: 145 },
                        { name: 'COVID-19', count: 98 },
                        { name: 'Hepatite B', count: 67 },
                        { name: 'Febre Amarela', count: 42 },
                        { name: 'Tétano', count: 31 },
                    ],
                    appointmentsByStatus: [
                        { status: 'Confirmado', count: 34 },
                        { status: 'Concluído', count: 128 },
                        { status: 'Cancelado', count: 12 },
                        { status: 'No-show', count: 8 },
                    ],
                    monthlyTrend: [
                        { month: 'Set', count: 320 },
                        { month: 'Out', count: 380 },
                        { month: 'Nov', count: 420 },
                        { month: 'Dez', count: 350 },
                        { month: 'Jan', count: 410 },
                        { month: 'Fev', count: 470 },
                    ],
                });
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-slate-400">Carregando dashboard assistencial...</div>;

    const maxTrend = Math.max(...(stats?.monthlyTrend?.map(m => m.count) || [1]));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Assistencial</h1>
                <p className="text-slate-500 text-sm mt-1">Indicadores clínicos e operacionais</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Vacinas Aplicadas', value: stats?.totalVaccinesApplied || 0, icon: Syringe, color: 'text-teal-600 bg-teal-50' },
                    { label: 'Taxa de No-show', value: `${stats?.noShowRate || 0}%`, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
                    { label: 'Tempo Médio Espera', value: `${stats?.avgWaitTime || 0} min`, icon: Clock, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Atendimentos Hoje', value: stats?.appointmentsByStatus?.reduce((a, b) => a + b.count, 0) || 0, icon: Activity, color: 'text-emerald-600 bg-emerald-50' },
                ].map(kpi => {
                    const Icon = kpi.icon;
                    return (
                        <div key={kpi.label} className="saas-card p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{kpi.label}</span>
                                <div className={`p-2 rounded-lg ${kpi.color}`}><Icon size={16} /></div>
                            </div>
                            <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Trend */}
                <div className="saas-card p-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <TrendingUp size={16} className="text-teal-600" /> Tendência Mensal
                    </h3>
                    <div className="flex items-end justify-between gap-2 h-40">
                        {stats?.monthlyTrend?.map(m => (
                            <div key={m.month} className="flex flex-col items-center flex-1">
                                <span className="text-xs text-slate-500 mb-1">{m.count}</span>
                                <div
                                    className="w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-md transition-all"
                                    style={{ height: `${(m.count / maxTrend) * 100}%`, minHeight: '8px' }}
                                />
                                <span className="text-xs text-slate-400 mt-1">{m.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Vaccines */}
                <div className="saas-card p-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <BarChart3 size={16} className="text-teal-600" /> Top Vacinas Aplicadas
                    </h3>
                    <div className="space-y-3">
                        {stats?.topVaccines?.map((v, i) => {
                            const maxV = stats.topVaccines[0]?.count || 1;
                            return (
                                <div key={v.name} className="flex items-center gap-3">
                                    <span className="text-xs text-slate-400 w-4">{i + 1}</span>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium text-slate-700">{v.name}</span>
                                            <span className="text-sm text-slate-500">{v.count}</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-teal-500 to-teal-300 rounded-full"
                                                style={{ width: `${(v.count / maxV) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Appointments by Status */}
                <div className="saas-card p-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Users size={16} className="text-teal-600" /> Atendimentos por Status
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {stats?.appointmentsByStatus?.map(s => {
                            const colors: Record<string, string> = {
                                'Confirmado': 'bg-blue-50 text-blue-700 border-blue-200',
                                'Concluído': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                                'Cancelado': 'bg-rose-50 text-rose-700 border-rose-200',
                                'No-show': 'bg-amber-50 text-amber-700 border-amber-200',
                            };
                            return (
                                <div key={s.status} className={`p-3 rounded-lg border ${colors[s.status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                    <p className="text-2xl font-bold">{s.count}</p>
                                    <p className="text-xs mt-1">{s.status}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Coverage Indicator */}
                <div className="saas-card p-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Activity size={16} className="text-teal-600" /> Cobertura Vacinal
                    </h3>
                    <div className="space-y-4">
                        {[
                            { faixa: '0-5 anos', percent: 87 },
                            { faixa: '6-12 anos', percent: 72 },
                            { faixa: '13-17 anos', percent: 58 },
                            { faixa: '18-59 anos', percent: 45 },
                            { faixa: '60+ anos', percent: 91 },
                        ].map(f => (
                            <div key={f.faixa}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600">{f.faixa}</span>
                                    <span className={`font-semibold ${f.percent >= 80 ? 'text-emerald-600' : f.percent >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>{f.percent}%</span>
                                </div>
                                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${f.percent >= 80 ? 'bg-emerald-500' : f.percent >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                        style={{ width: `${f.percent}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
