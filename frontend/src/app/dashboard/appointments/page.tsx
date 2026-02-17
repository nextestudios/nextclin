'use client';

import { useEffect, useState } from 'react';
import api from '../../../services/api';

interface Appointment {
    id: string;
    patient: { name: string; prontuario: string };
    startTime: string;
    endTime: string;
    type: string;
    status: string;
}

const statusColors: Record<string, string> = {
    REQUESTED: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-purple-100 text-purple-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-red-100 text-red-700',
    NO_SHOW: 'bg-slate-100 text-slate-700',
};

const statusLabels: Record<string, string> = {
    REQUESTED: 'Solicitado',
    CONFIRMED: 'Confirmado',
    IN_PROGRESS: 'Em Atendimento',
    COMPLETED: 'Finalizado',
    CANCELLED: 'Cancelado',
    NO_SHOW: 'Não Compareceu',
};

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        patientId: '', professionalId: '', unitId: '', vaccineId: '',
        startTime: '', endTime: '', type: 'CLINIC', notes: '',
    });

    useEffect(() => {
        loadAppointments();
    }, [selectedDate]);

    async function loadAppointments() {
        try {
            const res = await api.get('/appointments', { params: { date: selectedDate } });
            setAppointments(res.data);
        } catch { }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            await api.post('/appointments', form);
            setShowForm(false);
            loadAppointments();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erro ao agendar.');
        }
    }

    async function updateStatus(id: string, status: string) {
        try {
            await api.put(`/appointments/${id}/status`, { status });
            loadAppointments();
        } catch { }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">📅 Agenda</h1>
                    <p className="text-slate-500 text-sm">Gerencie os agendamentos da clínica</p>
                </div>
                <div className="flex gap-3">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-4 py-2.5 border border-slate-200 rounded-lg text-black placeholder-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none"
                    />
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
                    >
                        + Novo Agendamento
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Novo Agendamento</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <input type="text" placeholder="ID Paciente *" required value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} className="px-4 py-2.5 border border-slate-200 rounded-lg text-black placeholder-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" />
                        <input type="text" placeholder="ID Profissional *" required value={form.professionalId} onChange={e => setForm({ ...form, professionalId: e.target.value })} className="px-4 py-2.5 border border-slate-200 rounded-lg text-black placeholder-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" />
                        <input type="text" placeholder="ID Unidade *" required value={form.unitId} onChange={e => setForm({ ...form, unitId: e.target.value })} className="px-4 py-2.5 border border-slate-200 rounded-lg text-black placeholder-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" />
                        <input type="datetime-local" placeholder="Início *" required value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className="px-4 py-2.5 border border-slate-200 rounded-lg text-black placeholder-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" />
                        <input type="datetime-local" placeholder="Fim *" required value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} className="px-4 py-2.5 border border-slate-200 rounded-lg text-black placeholder-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" />
                        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="px-4 py-2.5 border border-slate-200 rounded-lg text-black focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all">
                            <option value="CLINIC">Clínica</option>
                            <option value="HOME">Domiciliar</option>
                        </select>
                        <div className="flex gap-2 col-span-full">
                            <button type="submit" className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">Agendar</button>
                            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors">Cancelar</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-3">
                {appointments.map((apt) => (
                    <div key={apt.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-16 text-center">
                                <p className="text-lg font-bold text-slate-800">{new Date(apt.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                <p className="text-xs text-slate-400">{new Date(apt.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <div className="border-l border-slate-200 pl-4">
                                <p className="font-medium text-slate-800">{apt.patient?.name || 'Paciente'}</p>
                                <p className="text-xs text-slate-400">{apt.type === 'HOME' ? '🏠 Domiciliar' : '🏥 Clínica'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[apt.status] || 'bg-slate-100'}`}>
                                {statusLabels[apt.status] || apt.status}
                            </span>
                            {apt.status === 'REQUESTED' && (
                                <button onClick={() => updateStatus(apt.id, 'CONFIRMED')} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs hover:bg-blue-200 transition-colors">Confirmar</button>
                            )}
                            {apt.status === 'CONFIRMED' && (
                                <button onClick={() => updateStatus(apt.id, 'IN_PROGRESS')} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs hover:bg-purple-200 transition-colors">Iniciar</button>
                            )}
                        </div>
                    </div>
                ))}
                {appointments.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-400">
                        Nenhum agendamento para esta data.
                    </div>
                )}
            </div>
        </div>
    );
}
