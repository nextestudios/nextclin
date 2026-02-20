'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    Activity, Users, Syringe, Clock,
    Banknote, CheckCircle, AlertTriangle, XCircle,
    TrendingUp, PieChart as PieChartIcon, Calendar, Package
} from 'lucide-react';

const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(m => m.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(m => m.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(m => m.Cell), { ssr: false });

interface FinancialStats {
    totalReceivable: number;
    totalReceived: number;
    totalPayable: number;
    overdueCount: number;
}

interface AttendanceStats {
    totalToday: number;
    completedToday: number;
    applicationsToday: number;
    waitingCount: number;
}

const DASHBOARD_COLORS = ['#0f766e', '#0369a1', '#b45309', '#be123c', '#4338ca', '#1d4ed8'];

export default function DashboardPage() {
    const { user } = useAuth();
    const [financialStats, setFinancialStats] = useState<FinancialStats | null>(null);
    const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
    const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
    const [lowStock, setLowStock] = useState<any[]>([]);
    const [stockSummary, setStockSummary] = useState<any>(null);

    useEffect(() => {
        api.get('/financial/dashboard').then(r => setFinancialStats(r.data)).catch(console.error);
        api.get('/attendances/stats/today').then(r => setAttendanceStats(r.data)).catch(console.error);
        api.get('/appointments/upcoming').then(r => setUpcomingAppointments(r.data?.slice(0, 5) || [])).catch(console.error);
        api.get('/reports/low-stock').then(r => setLowStock(r.data || [])).catch(console.error);
        api.get('/reports/stock-summary').then(r => setStockSummary(r.data)).catch(console.error);
    }, []);

    const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

    const financialChartData = financialStats ? [
        { name: 'A Receber', valor: Number(financialStats.totalReceivable) || 0 },
        { name: 'Recebido', valor: Number(financialStats.totalReceived) || 0 },
        { name: 'A Pagar', valor: Number(financialStats.totalPayable) || 0 },
    ] : [];

    const attendanceChartData = attendanceStats ? [
        { name: 'Total', value: attendanceStats.totalToday || 0 },
        { name: 'Finalizados', value: attendanceStats.completedToday || 0 },
        { name: 'Vacinas', value: attendanceStats.applicationsToday || 0 },
        { name: 'Na Fila', value: attendanceStats.waitingCount || 0 },
    ] : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Painel de Controle</h1>
                    <p className="text-slate-500 text-sm mt-1">Resumo operacional e financeiro da NextClin</p>
                </div>
            </div>

            {/* Attendance Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="saas-card p-5 border-l-4 border-l-teal-600">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Atendimentos Hoje</p>
                            <p className="text-2xl font-bold text-slate-800 mt-2">{attendanceStats?.totalToday ?? '—'}</p>
                        </div>
                        <div className="bg-teal-50 p-2 rounded-sm text-teal-600">
                            <Activity size={20} />
                        </div>
                    </div>
                </div>

                <div className="saas-card p-5 border-l-4 border-l-emerald-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Finalizados</p>
                            <p className="text-2xl font-bold text-slate-800 mt-2">{attendanceStats?.completedToday ?? '—'}</p>
                        </div>
                        <div className="bg-emerald-50 p-2 rounded-sm text-emerald-600">
                            <CheckCircle size={20} />
                        </div>
                    </div>
                </div>

                <div className="saas-card p-5 border-l-4 border-l-indigo-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vacinas Aplicadas</p>
                            <p className="text-2xl font-bold text-slate-800 mt-2">{attendanceStats?.applicationsToday ?? '—'}</p>
                        </div>
                        <div className="bg-indigo-50 p-2 rounded-sm text-indigo-600">
                            <Syringe size={20} />
                        </div>
                    </div>
                </div>

                <div className="saas-card p-5 border-l-4 border-l-amber-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Na Fila</p>
                            <p className="text-2xl font-bold text-slate-800 mt-2">{attendanceStats?.waitingCount ?? '—'}</p>
                        </div>
                        <div className="bg-amber-50 p-2 rounded-sm text-amber-600">
                            <Clock size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="saas-card p-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">A Receber</p>
                            <p className="text-2xl font-bold text-slate-800 mt-2">{formatCurrency(financialStats?.totalReceivable || 0)}</p>
                        </div>
                        <div className="bg-blue-50 p-2 rounded-sm text-blue-600">
                            <Banknote size={20} />
                        </div>
                    </div>
                </div>

                <div className="saas-card p-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recebido</p>
                            <p className="text-2xl font-bold text-slate-800 mt-2">{formatCurrency(financialStats?.totalReceived || 0)}</p>
                        </div>
                        <div className="bg-green-50 p-2 rounded-sm text-green-600">
                            <Banknote size={20} />
                        </div>
                    </div>
                </div>

                <div className="saas-card p-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">A Pagar</p>
                            <p className="text-2xl font-bold text-slate-800 mt-2">{formatCurrency(financialStats?.totalPayable || 0)}</p>
                        </div>
                        <div className="bg-red-50 p-2 rounded-sm text-red-600">
                            <Banknote size={20} />
                        </div>
                    </div>
                </div>

                <div className="saas-card p-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inadimplentes</p>
                            <p className="text-2xl font-bold text-slate-800 mt-2">{financialStats?.overdueCount ?? '—'}</p>
                        </div>
                        <div className="bg-rose-50 p-2 rounded-sm text-rose-600">
                            <AlertTriangle size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Financial Bar Chart */}
                <div className="saas-card p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                        <TrendingUp size={20} className="text-slate-400" />
                        <h2 className="text-base font-semibold text-slate-800">Fluxo Financeiro</h2>
                    </div>
                    {financialChartData.length > 0 ? (
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={financialChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={80} />
                                    <Tooltip
                                        formatter={(v: any) => formatCurrency(Number(v))}
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="valor" radius={[2, 2, 0, 0]} maxBarSize={50}>
                                        {financialChartData.map((_, i) => (
                                            <Cell key={i} fill={DASHBOARD_COLORS[i % DASHBOARD_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[250px] flex items-center justify-center">
                            <p className="text-slate-400 text-sm">Carregando métricas financeiras...</p>
                        </div>
                    )}
                </div>

                {/* Attendance Pie Chart */}
                <div className="saas-card p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                        <PieChartIcon size={20} className="text-slate-400" />
                        <h2 className="text-base font-semibold text-slate-800">Atendimentos por Categoria</h2>
                    </div>
                    {attendanceChartData.some(d => d.value > 0) ? (
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={attendanceChartData.filter(d => d.value > 0)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={90}
                                        paddingAngle={2}
                                        dataKey="value"
                                        label={({ name, value }: any) => `${name} (${value})`}
                                        labelLine={false}
                                    >
                                        {attendanceChartData.map((_, i) => (
                                            <Cell key={i} fill={DASHBOARD_COLORS[i % DASHBOARD_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[250px] flex items-center justify-center">
                            <p className="text-slate-400 text-sm">Nenhum dado de atendimento hoje.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Row: Appointments + Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                {/* Upcoming Appointments */}
                <div className="saas-card flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                        <Calendar size={20} className="text-slate-400" />
                        <h2 className="text-base font-semibold text-slate-800">Próximos Agendamentos</h2>
                    </div>
                    <div className="p-0 flex-1">
                        {upcomingAppointments.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">Nenhum agendamento próximo.</div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {upcomingAppointments.map((a: any) => (
                                    <div key={a.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-center justify-center bg-slate-100 text-slate-700 rounded-sm w-12 h-12">
                                                <span className="text-sm font-bold leading-none">
                                                    {a.startTime ? new Date(a.startTime).toLocaleDateString('pt-BR', { day: '2-digit' }) : '--'}
                                                </span>
                                                <span className="text-[10px] font-medium uppercase mt-1">
                                                    {a.startTime ? new Date(a.startTime).toLocaleDateString('pt-BR', { month: 'short' }) : '--'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{a.patient?.name || 'Paciente'}</p>
                                                <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                                                    <Clock size={12} />
                                                    <span>{a.startTime ? new Date(a.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                                                    <span className="mx-1">•</span>
                                                    <span>{a.type === 'HOME' ? 'Domiciliar' : 'Clínica'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-sm ${a.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                                    a.status === 'REQUESTED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                        'bg-slate-100 text-slate-600 border border-slate-200'
                                                }`}>
                                                {a.status === 'CONFIRMED' ? 'Confirmado' : a.status === 'REQUESTED' ? 'Solicitado' : a.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Low Stock Alerts + Stock Summary */}
                <div className="saas-card flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                        <Package size={20} className="text-slate-400" />
                        <h2 className="text-base font-semibold text-slate-800">Situação do Estoque</h2>
                    </div>

                    <div className="p-6">
                        {stockSummary && (
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-slate-50 rounded-sm p-4 text-center border border-slate-100">
                                    <p className="text-2xl font-bold text-slate-800">{stockSummary.totalDoses || 0}</p>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-1">Doses Válidas</p>
                                </div>
                                <div className="bg-emerald-50 rounded-sm p-4 text-center border border-emerald-100">
                                    <p className="text-2xl font-bold text-emerald-700">{stockSummary.validBatches || 0}</p>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 mt-1">Lotes OK</p>
                                </div>
                                <div className="bg-rose-50 rounded-sm p-4 text-center border border-rose-100">
                                    <p className="text-2xl font-bold text-rose-700">{stockSummary.expiredBatches || 0}</p>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 mt-1">Vencidos</p>
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Estoque Baixo</h3>
                            {lowStock.length === 0 ? (
                                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-sm border border-emerald-100">
                                    <CheckCircle size={16} />
                                    <span className="text-sm font-medium">Estoque normal para todas as vacinas.</span>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {lowStock.map((v: any) => (
                                        <div key={v.vaccineId} className="flex items-center justify-between bg-white border border-rose-200 rounded-sm px-4 py-3 shadow-sm shadow-rose-100/50">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-rose-100 p-1.5 rounded-sm text-rose-600">
                                                    <AlertTriangle size={16} />
                                                </div>
                                                <span className="text-sm font-medium text-slate-800">{v.vaccineName}</span>
                                            </div>
                                            <div className="text-xs font-semibold px-2 py-1 bg-rose-50 text-rose-700 rounded-sm border border-rose-200">
                                                {v.totalStock} / {v.minimumStock} min
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
