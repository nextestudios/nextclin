'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Olá, {user?.name || 'Usuário'} 👋</h1>
                <p className="text-slate-500">Bem-vindo ao NextClin — Painel de Controle</p>
            </div>

            {/* Attendance Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
                    <p className="text-sm opacity-80">Atendimentos Hoje</p>
                    <p className="text-3xl font-bold mt-1">{attendanceStats?.totalToday ?? '—'}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
                    <p className="text-sm opacity-80">Finalizados Hoje</p>
                    <p className="text-3xl font-bold mt-1">{attendanceStats?.completedToday ?? '—'}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
                    <p className="text-sm opacity-80">Vacinas Aplicadas Hoje</p>
                    <p className="text-3xl font-bold mt-1">{attendanceStats?.applicationsToday ?? '—'}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
                    <p className="text-sm opacity-80">Na Fila Agora</p>
                    <p className="text-3xl font-bold mt-1">{attendanceStats?.waitingCount ?? '—'}</p>
                </div>
            </div>

            {/* Financial Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow p-5 border-l-4 border-blue-500">
                    <p className="text-sm text-slate-500">A Receber (Aberto)</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(financialStats?.totalReceivable || 0)}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-5 border-l-4 border-green-500">
                    <p className="text-sm text-slate-500">Recebido</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(financialStats?.totalReceived || 0)}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-5 border-l-4 border-red-500">
                    <p className="text-sm text-slate-500">A Pagar</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(financialStats?.totalPayable || 0)}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-5 border-l-4 border-yellow-500">
                    <p className="text-sm text-slate-500">Inadimplentes</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{financialStats?.overdueCount ?? '—'}</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Financial Bar Chart */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">💰 Fluxo Financeiro</h2>
                    {financialChartData.length > 0 ? (
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={financialChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                                    <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                                        {financialChartData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-slate-400 text-center py-8">Carregando dados...</p>
                    )}
                </div>

                {/* Attendance Pie Chart */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">🏥 Atendimentos Hoje</h2>
                    {attendanceChartData.some(d => d.value > 0) ? (
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={attendanceChartData.filter(d => d.value > 0)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        dataKey="value"
                                        label={({ name, value }: any) => `${name}: ${value}`}
                                    >
                                        {attendanceChartData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-slate-400 text-center py-8">Sem atendimentos hoje</p>
                    )}
                </div>
            </div>

            {/* Bottom Row: Appointments + Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Appointments */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">📅 Próximos Agendamentos</h2>
                    {upcomingAppointments.length === 0 ? (
                        <p className="text-slate-400 text-center py-4">Nenhum agendamento próximo.</p>
                    ) : (
                        <div className="space-y-3">
                            {upcomingAppointments.map((a: any) => (
                                <div key={a.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 text-blue-700 rounded-lg px-3 py-1 text-sm font-medium text-center min-w-[60px]">
                                            {a.startTime ? new Date(a.startTime).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '--'}
                                            <br />
                                            <span className="text-xs">
                                                {a.startTime ? new Date(a.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800">{a.patient?.name || 'Paciente'}</p>
                                            <p className="text-sm text-slate-500">{a.type === 'HOME' ? '🏠 Domiciliar' : '🏥 Clínica'}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${a.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                                        a.status === 'REQUESTED' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                        {a.status === 'CONFIRMED' ? 'Confirmado' : a.status === 'REQUESTED' ? 'Solicitado' : a.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Low Stock Alerts + Stock Summary */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">📦 Alertas de Estoque</h2>
                    {stockSummary && (
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="bg-blue-50 rounded-lg p-3 text-center">
                                <p className="text-2xl font-bold text-blue-600">{stockSummary.totalDoses || 0}</p>
                                <p className="text-xs text-slate-500">Doses válidas</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3 text-center">
                                <p className="text-2xl font-bold text-green-600">{stockSummary.validBatches || 0}</p>
                                <p className="text-xs text-slate-500">Lotes válidos</p>
                            </div>
                            <div className="bg-red-50 rounded-lg p-3 text-center">
                                <p className="text-2xl font-bold text-red-600">{stockSummary.expiredBatches || 0}</p>
                                <p className="text-xs text-slate-500">Lotes vencidos</p>
                            </div>
                        </div>
                    )}
                    {lowStock.length === 0 ? (
                        <p className="text-green-600 text-center py-2">✅ Nenhuma vacina abaixo do estoque mínimo</p>
                    ) : (
                        <div className="space-y-2">
                            {lowStock.map((v: any) => (
                                <div key={v.vaccineId} className="flex items-center justify-between bg-red-50 rounded-lg px-4 py-2">
                                    <span className="font-medium text-red-800">{v.vaccineName}</span>
                                    <span className="text-sm text-red-600">
                                        {v.totalStock} / {v.minimumStock} mínimo
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
