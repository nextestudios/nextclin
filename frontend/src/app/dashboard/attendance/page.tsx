'use client';

import { useState, useEffect } from 'react';
import api from '../../../services/api';

interface Attendance {
    id: string;
    code: string;
    status: string;
    priority: string;
    notes: string;
    patient?: { name: string; cpf: string };
    createdAt: string;
}

const priorityColors: Record<string, string> = {
    HIGH: 'bg-red-100 text-red-800 border-red-300',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    LOW: 'bg-blue-100 text-blue-800 border-blue-300',
    ELECTIVE: 'bg-gray-100 text-gray-800 border-gray-300',
};

const priorityLabels: Record<string, string> = {
    HIGH: 'Alta', MEDIUM: 'Média', LOW: 'Baixa', ELECTIVE: 'Eletiva',
};

const statusLabels: Record<string, string> = {
    WAITING: 'Aguardando', IN_PROGRESS: 'Em Atendimento', COMPLETED: 'Finalizado', CANCELLED: 'Cancelado',
};

export default function AttendancePage() {
    const [queue, setQueue] = useState<Attendance[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [patients, setPatients] = useState<any[]>([]);
    const [professionals, setProfessionals] = useState<any[]>([]);
    const [form, setForm] = useState({ patientId: '', professionalId: '', unitId: 'default', priority: 'MEDIUM', notes: '' });

    const loadQueue = () => {
        api.get('/attendances/queue').then(r => setQueue(r.data)).catch(console.error);
    };

    useEffect(() => {
        loadQueue();
        api.get('/patients').then(r => setPatients(r.data)).catch(console.error);
        api.get('/professionals').then(r => setProfessionals(r.data)).catch(console.error);
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/attendances', form);
            loadQueue();
            setShowForm(false);
            setForm({ patientId: '', professionalId: '', unitId: 'default', priority: 'MEDIUM', notes: '' });
        } catch (err) { console.error(err); }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/attendances/${id}/status`, { status });
            loadQueue();
        } catch (err) { console.error(err); }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Fila de Atendimento</h1>
                <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    {showForm ? 'Cancelar' : '+ Novo Atendimento'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="bg-white rounded-xl shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Paciente *</label>
                        <select value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} required
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black">
                            <option value="">Selecione um paciente</option>
                            {patients.map(p => <option key={p.id} value={p.id}>{p.name} - {p.cpf}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Profissional</label>
                        <select value={form.professionalId} onChange={e => setForm({ ...form, professionalId: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black">
                            <option value="">Selecione</option>
                            {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Prioridade</label>
                        <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black">
                            <option value="ELECTIVE">Eletiva</option>
                            <option value="LOW">Baixa</option>
                            <option value="MEDIUM">Média</option>
                            <option value="HIGH">Alta</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                        <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" placeholder="Notas opcionais" />
                    </div>
                    <div className="md:col-span-2">
                        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">Criar Atendimento</button>
                    </div>
                </form>
            )}

            <div className="space-y-3">
                {queue.length === 0 && <p className="text-slate-500 text-center py-8">Nenhum atendimento na fila.</p>}
                {queue.map((a, idx) => (
                    <div key={a.id} className="bg-white rounded-xl shadow p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-2xl font-bold text-slate-300 w-8">{idx + 1}</span>
                            <div>
                                <p className="font-semibold text-slate-800">{a.patient?.name || 'Paciente'}</p>
                                <p className="text-sm text-slate-500">Código: {a.code}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full border font-medium ${priorityColors[a.priority] || ''}`}>
                                {priorityLabels[a.priority] || a.priority}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                                {statusLabels[a.status] || a.status}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {a.status === 'WAITING' && (
                                <button onClick={() => updateStatus(a.id, 'IN_PROGRESS')} className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600">Iniciar</button>
                            )}
                            {a.status === 'IN_PROGRESS' && (
                                <button onClick={() => updateStatus(a.id, 'COMPLETED')} className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600">Finalizar</button>
                            )}
                            {(a.status === 'WAITING' || a.status === 'IN_PROGRESS') && (
                                <button onClick={() => updateStatus(a.id, 'CANCELLED')} className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600">Cancelar</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
