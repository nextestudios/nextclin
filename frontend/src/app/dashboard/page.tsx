'use client';

import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import api from '../../services/api';

interface DashboardStats {
    totalReceivable: number;
    totalReceived: number;
    totalPayable: number;
    overdueCount: number;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        api.get('/financial/dashboard').then(r => setStats(r.data)).catch(() => { });
    }, []);

    const cards = [
        { title: 'A Receber', value: `R$ ${stats?.totalReceivable || '0,00'}`, color: 'from-blue-500 to-blue-600', icon: '💳' },
        { title: 'Recebido', value: `R$ ${stats?.totalReceived || '0,00'}`, color: 'from-emerald-500 to-emerald-600', icon: '✅' },
        { title: 'A Pagar', value: `R$ ${stats?.totalPayable || '0,00'}`, color: 'from-amber-500 to-amber-600', icon: '📋' },
        { title: 'Inadimplentes', value: `${stats?.overdueCount || 0}`, color: 'from-red-500 to-red-600', icon: '⚠️' },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                <p className="text-slate-500">Bem-vindo, {user?.name}!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {cards.map((card) => (
                    <div key={card.title} className={`bg-gradient-to-br ${card.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-200`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm opacity-80">{card.title}</p>
                                <p className="text-2xl font-bold mt-1">{card.value}</p>
                            </div>
                            <span className="text-3xl">{card.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">📅 Próximos Agendamentos</h2>
                    <p className="text-slate-400 text-sm">Conecte-se ao sistema para ver os dados.</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">💉 Vacinas Aplicadas Hoje</h2>
                    <p className="text-slate-400 text-sm">Conecte-se ao sistema para ver os dados.</p>
                </div>
            </div>
        </div>
    );
}
