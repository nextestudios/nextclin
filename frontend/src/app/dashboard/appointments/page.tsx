'use client';

import { useState, useEffect } from 'react';
import api from '../../../services/api';

const statusLabels: Record<string, string> = {
    REQUESTED: 'Solicitado', CONFIRMED: 'Confirmado', IN_PROGRESS: 'Em Andamento',
    COMPLETED: 'Concluído', CANCELLED: 'Cancelado', NO_SHOW: 'Não Compareceu',
};
const statusColors: Record<string, string> = {
    REQUESTED: 'bg-yellow-100 text-yellow-800', CONFIRMED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800', COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-gray-100 text-gray-500', NO_SHOW: 'bg-red-100 text-red-800',
};

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [patients, setPatients] = useState<any[]>([]);
    const [professionals, setProfessionals] = useState<any[]>([]);
    const [vaccines, setVaccines] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [form, setForm] = useState({
        patientId: '', professionalId: '', unitId: 'default', vaccineId: '',
        type: 'CLINIC', startTime: '', endTime: '',
        homeAddress: '', displacementFee: 0, notes: '',
    });

    const load = () => {
        api.get(`/appointments?date=${selectedDate}`).then(r => setAppointments(r.data)).catch(console.error);
    };

    useEffect(() => {
        load();
        api.get('/patients').then(r => setPatients(r.data)).catch(console.error);
        api.get('/professionals').then(r => setProfessionals(r.data)).catch(console.error);
        api.get('/vaccines').then(r => setVaccines(r.data)).catch(console.error);
    }, []);

    useEffect(() => { load(); }, [selectedDate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/appointments', form);
            load();
            setShowForm(false);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erro ao criar agendamento');
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/appointments/${id}/status`, { status });
            load();
        } catch (err) { console.error(err); }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Agenda</h1>
                <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    {showForm ? 'Cancelar' : '+ Novo Agendamento'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Paciente *</label>
                            <select value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} required
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black">
                                <option value="">Selecione</option>
                                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Profissional *</label>
                            <select value={form.professionalId} onChange={e => setForm({ ...form, professionalId: e.target.value })} required
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black">
                                <option value="">Selecione</option>
                                {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Vacina</label>
                            <select value={form.vaccineId} onChange={e => setForm({ ...form, vaccineId: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black">
                                <option value="">Selecione (opcional)</option>
                                {vaccines.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black">
                                <option value="CLINIC">🏥 Clínica</option>
                                <option value="HOME">🏠 Domiciliar</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Início *</label>
                            <input type="datetime-local" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} required
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Fim *</label>
                            <input type="datetime-local" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} required
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" />
                        </div>

                        {form.type === 'HOME' && (
                            <>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Endereço do Domicílio</label>
                                    <input type="text" value={form.homeAddress} onChange={e => setForm({ ...form, homeAddress: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" placeholder="Endereço completo" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Taxa de Deslocamento (R$)</label>
                                    <input type="number" step="0.01" value={form.displacementFee} onChange={e => setForm({ ...form, displacementFee: Number(e.target.value) })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" />
                                </div>
                            </>
                        )}

                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                            <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" />
                        </div>
                    </div>
                    <button type="submit" className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">Agendar</button>
                </form>
            )}

            {/* Date selector */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => {
                    const d = new Date(selectedDate); d.setDate(d.getDate() - 1);
                    setSelectedDate(d.toISOString().split('T')[0]);
                }} className="bg-slate-200 px-3 py-2 rounded-lg hover:bg-slate-300">◀</button>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-black" />
                <button onClick={() => {
                    const d = new Date(selectedDate); d.setDate(d.getDate() + 1);
                    setSelectedDate(d.toISOString().split('T')[0]);
                }} className="bg-slate-200 px-3 py-2 rounded-lg hover:bg-slate-300">▶</button>
                <span className="text-slate-500 text-sm">{appointments.length} agendamento(s)</span>
            </div>

            {/* Appointments list */}
            <div className="space-y-3">
                {appointments.length === 0 && <p className="text-slate-400 text-center py-8">Nenhum agendamento para este dia.</p>}
                {appointments.map((a: any) => (
                    <div key={a.id} className="bg-white rounded-xl shadow p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <p className="text-lg font-bold text-blue-600">
                                    {a.startTime ? new Date(a.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {a.endTime ? new Date(a.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                </p>
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800">{a.patient?.name || 'Paciente'}</p>
                                <p className="text-sm text-slate-500">
                                    {a.type === 'HOME' ? '🏠 Domiciliar' : '🏥 Clínica'}
                                    {a.notes && ` • ${a.notes}`}
                                </p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[a.status] || ''}`}>
                                {statusLabels[a.status] || a.status}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {a.status === 'REQUESTED' && (
                                <button onClick={() => updateStatus(a.id, 'CONFIRMED')} className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600">Confirmar</button>
                            )}
                            {a.status === 'CONFIRMED' && (
                                <button onClick={() => updateStatus(a.id, 'IN_PROGRESS')} className="text-sm bg-purple-500 text-white px-3 py-1 rounded-lg hover:bg-purple-600">Iniciar</button>
                            )}
                            {a.status === 'IN_PROGRESS' && (
                                <button onClick={() => updateStatus(a.id, 'COMPLETED')} className="text-sm bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600">Concluir</button>
                            )}
                            {['REQUESTED', 'CONFIRMED'].includes(a.status) && (
                                <>
                                    <button onClick={() => updateStatus(a.id, 'CANCELLED')} className="text-sm bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600">Cancelar</button>
                                    <button onClick={() => updateStatus(a.id, 'NO_SHOW')} className="text-sm bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600">No-show</button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
