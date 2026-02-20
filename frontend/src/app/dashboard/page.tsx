'use client';

import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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

export default function DashboardPage() {
    const { user } = useAuth();
    const [financialStats, setFinancialStats] = useState<FinancialStats | null>(null);
    const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
    const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);

    useEffect(() => {
        api.get('/financial/dashboard').then(r => setFinancialStats(r.data)).catch(console.error);
        api.get('/attendances/stats/today').then(r => setAttendanceStats(r.data)).catch(console.error);
        api.get('/appointments/upcoming').then(r => setUpcomingAppointments(r.data?.slice(0, 5) || [])).catch(console.error);
    }, []);

    const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Olá, {user?.name || 'Usuário'} 👋</h1>
                <p className="text-slate-500">Bem-vindo ao NextClin — Painel de Controle</p>
            </div>

            {/* Attendance Stats */}
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

            {/* Financial Stats */}
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
        </div>
    );
}
