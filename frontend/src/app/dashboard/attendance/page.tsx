'use client';

import { useEffect, useState } from 'react';
import api from '../../../services/api';

interface Attendance {
    id: string;
    code: string;
    patient: { name: string; prontuario: string };
    priority: string;
    status: string;
    createdAt: string;
}

const priorityColors: Record<string, string> = {
    HIGH: 'bg-red-100 text-red-700 border-red-300',
    MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    LOW: 'bg-green-100 text-green-700 border-green-300',
    ELECTIVE: 'bg-slate-100 text-slate-600 border-slate-300',
};

const priorityLabels: Record<string, string> = {
    HIGH: '🔴 Alta',
    MEDIUM: '🟡 Média',
    LOW: '🟢 Baixa',
    ELECTIVE: '⚪ Eletiva',
};

export default function AttendancePage() {
    const [queue, setQueue] = useState<Attendance[]>([]);

    useEffect(() => {
        loadQueue();
    }, []);

    async function loadQueue() {
        try {
            const res = await api.get('/attendances/queue');
            setQueue(res.data);
        } catch { }
    }

    async function updateStatus(id: string, status: string) {
        try {
            await api.put(`/attendances/${id}/status`, { status });
            loadQueue();
        } catch { }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">🏥 Fila de Atendimento</h1>
                    <p className="text-slate-500 text-sm">Pacientes ordenados por prioridade</p>
                </div>
                <button onClick={loadQueue} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm">
                    🔄 Atualizar
                </button>
            </div>

            <div className="space-y-3">
                {queue.map((atd, idx) => (
                    <div key={atd.id} className={`bg-white rounded-xl shadow-sm border p-5 flex items-center justify-between hover:shadow-md transition-shadow ${atd.priority === 'HIGH' ? 'border-red-200 bg-red-50/30' : 'border-slate-200'}`}>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                {idx + 1}
                            </div>
                            <div>
                                <p className="font-medium text-slate-800">{atd.patient?.name || 'Paciente'}</p>
                                <p className="text-xs text-slate-400">Código: {atd.code} | {atd.patient?.prontuario}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityColors[atd.priority]}`}>
                                {priorityLabels[atd.priority]}
                            </span>
                            {atd.status === 'WAITING' && (
                                <button onClick={() => updateStatus(atd.id, 'IN_PROGRESS')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                                    Iniciar Atendimento
                                </button>
                            )}
                            {atd.status === 'IN_PROGRESS' && (
                                <button onClick={() => updateStatus(atd.id, 'COMPLETED')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors">
                                    Finalizar
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {queue.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-400">
                        Fila de atendimento vazia.
                    </div>
                )}
            </div>
        </div>
    );
}
