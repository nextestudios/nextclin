'use client';

import { useState, useEffect } from 'react';
import api from '../../../services/api';
import {
    Calendar as CalendarIcon, Plus, X, ChevronLeft, ChevronRight,
    Clock, MapPin, CheckCircle, Play, CheckCircle2, XCircle, UserX,
    Home, Building2
} from 'lucide-react';

const statusLabels: Record<string, string> = {
    REQUESTED: 'Solicitado', CONFIRMED: 'Confirmado', IN_PROGRESS: 'Em Andamento',
    COMPLETED: 'Concluído', CANCELLED: 'Cancelado', NO_SHOW: 'Não Compareceu',
};

const statusColors: Record<string, string> = {
    REQUESTED: 'bg-amber-50 text-amber-700 border-amber-200',
    CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
    IN_PROGRESS: 'bg-purple-50 text-purple-700 border-purple-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200',
    NO_SHOW: 'bg-rose-50 text-rose-700 border-rose-200',
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
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 saas-card">
                <div className="flex items-center gap-3">
                    <div className="bg-teal-100 p-2 text-teal-700 rounded-sm">
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Agenda</h1>
                        <p className="text-slate-500 text-sm mt-1">Gerenciamento de consultas clínicas e domiciliares</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={showForm ? "saas-button-secondary" : "saas-button-primary"}
                >
                    {showForm ? <><X size={18} /> Fechar</> : <><Plus size={18} /> Novo Agendamento</>}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="saas-card p-8 bg-white border-t-4 border-t-teal-600">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">Detalhes do Agendamento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="saas-label">Paciente *</label>
                            <select value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} required className="saas-input">
                                <option value="">Selecione o paciente</option>
                                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="saas-label">Profissional *</label>
                            <select value={form.professionalId} onChange={e => setForm({ ...form, professionalId: e.target.value })} required className="saas-input">
                                <option value="">Selecione o profissional</option>
                                {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="saas-label">Vacina (Opcional)</label>
                            <select value={form.vaccineId} onChange={e => setForm({ ...form, vaccineId: e.target.value })} className="saas-input">
                                <option value="">Selecione a vacina</option>
                                {vaccines.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="saas-label">Modalidade de Atendimento</label>
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="saas-input font-medium">
                                <option value="CLINIC">🏥 Atendimento Clínico</option>
                                <option value="HOME">🏠 Visita Domiciliar</option>
                            </select>
                        </div>
                        <div>
                            <label className="saas-label">Data/Hora Início *</label>
                            <input type="datetime-local" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} required className="saas-input" />
                        </div>
                        <div>
                            <label className="saas-label">Data/Hora Fim *</label>
                            <input type="datetime-local" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} required className="saas-input" />
                        </div>

                        {form.type === 'HOME' && (
                            <>
                                <div className="md:col-span-2">
                                    <label className="saas-label text-amber-700 font-semibold">📍 Endereço do Domicílio</label>
                                    <input type="text" value={form.homeAddress} onChange={e => setForm({ ...form, homeAddress: e.target.value })} className="saas-input border-amber-300 focus:ring-amber-500" placeholder="Endereço completo para a visita" />
                                </div>
                                <div>
                                    <label className="saas-label text-amber-700 font-semibold">Taxa de Deslocamento (R$)</label>
                                    <input type="number" step="0.01" value={form.displacementFee} onChange={e => setForm({ ...form, displacementFee: Number(e.target.value) })} className="saas-input border-amber-300 focus:ring-amber-500" />
                                </div>
                            </>
                        )}

                        <div className="md:col-span-3">
                            <label className="saas-label">Observações da Consulta</label>
                            <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="saas-input" placeholder="Detalhes adicionais, recomendações..." />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
                        <button type="submit" className="saas-button-primary"> <CheckCircle2 size={18} /> Confirmar Agendamento</button>
                    </div>
                </form>
            )}

            {!showForm && (
                <>
                    {/* Date Navigation */}
                    <div className="flex items-center gap-4 bg-white p-4 saas-card">
                        <button onClick={() => {
                            const d = new Date(selectedDate); d.setDate(d.getDate() - 1);
                            setSelectedDate(d.toISOString().split('T')[0]);
                        }} className="p-2 border border-slate-200 rounded-sm text-slate-500 hover:bg-slate-50 transition-colors">
                            <ChevronLeft size={20} />
                        </button>

                        <div className="flex-1 max-w-xs relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-teal-600">
                                <CalendarIcon size={18} />
                            </div>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={e => setSelectedDate(e.target.value)}
                                className="saas-input !pl-10 w-full font-medium text-slate-800 cursor-pointer"
                            />
                        </div>

                        <button onClick={() => {
                            const d = new Date(selectedDate); d.setDate(d.getDate() + 1);
                            setSelectedDate(d.toISOString().split('T')[0]);
                        }} className="p-2 border border-slate-200 rounded-sm text-slate-500 hover:bg-slate-50 transition-colors">
                            <ChevronRight size={20} />
                        </button>

                        <div className="ml-auto bg-slate-100 text-slate-600 text-sm font-semibold px-4 py-2 rounded-sm border border-slate-200">
                            {appointments.length} Sessão(ões) Hoje
                        </div>
                    </div>

                    {/* Appointments list */}
                    <div className="space-y-3">
                        {appointments.length === 0 && (
                            <div className="saas-card p-12 text-center flex flex-col items-center justify-center text-slate-400">
                                <CalendarIcon size={48} className="opacity-20 mb-4" />
                                <p className="font-medium text-lg text-slate-500">Nenhum agendamento para este dia.</p>
                                <p className="text-sm mt-1">Aproveite para organizar a clínica ou cadastrar novos pacientes.</p>
                            </div>
                        )}

                        {appointments.map((a: any) => (
                            <div key={a.id} className="saas-card p-0 flex items-stretch overflow-hidden group">
                                {/* Time Block */}
                                <div className="bg-slate-50 border-r border-slate-100 p-5 flex flex-col items-center justify-center min-w-[120px]">
                                    <Clock size={16} className="text-teal-600 mb-1" />
                                    <p className="text-xl font-bold text-slate-800 tracking-tight">
                                        {a.startTime ? new Date(a.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                    </p>
                                    <p className="text-xs text-slate-400 font-medium">
                                        até {a.endTime ? new Date(a.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                    </p>
                                </div>

                                {/* Info Block */}
                                <div className="flex-1 p-5 flex flex-col justify-center">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-lg font-bold text-slate-900">{a.patient?.name || 'Paciente'}</p>
                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-sm border ${statusColors[a.status] || ''}`}>
                                            {statusLabels[a.status] || a.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-sm ${a.type === 'HOME' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                                            {a.type === 'HOME' ? <Home size={14} /> : <Building2 size={14} />}
                                            {a.type === 'HOME' ? 'Atendimento Domiciliar' : 'Atendimento Clínico'}
                                        </div>
                                        {a.notes && (
                                            <p className="text-sm text-slate-500 flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                                                {a.notes}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Actions Block */}
                                <div className="p-5 flex items-center justify-end gap-2 border-l border-slate-50 bg-white group-hover:bg-slate-50/50 transition-colors">
                                    {a.status === 'REQUESTED' && (
                                        <button onClick={() => updateStatus(a.id, 'CONFIRMED')} className="p-2 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border border-blue-200 rounded-sm transition-colors text-sm font-medium flex items-center gap-1.5" title="Confirmar">
                                            <CheckCircle2 size={16} /> Confirmar
                                        </button>
                                    )}
                                    {a.status === 'CONFIRMED' && (
                                        <button onClick={() => updateStatus(a.id, 'IN_PROGRESS')} className="p-2 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800 border border-purple-200 rounded-sm transition-colors text-sm font-medium flex items-center gap-1.5" title="Iniciar">
                                            <Play size={16} /> Iniciar
                                        </button>
                                    )}
                                    {a.status === 'IN_PROGRESS' && (
                                        <button onClick={() => updateStatus(a.id, 'COMPLETED')} className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border border-emerald-200 rounded-sm transition-colors text-sm font-medium flex items-center gap-1.5" title="Concluir">
                                            <CheckCircle size={16} /> Concluir
                                        </button>
                                    )}
                                    {['REQUESTED', 'CONFIRMED'].includes(a.status) && (
                                        <>
                                            <button onClick={() => updateStatus(a.id, 'CANCELLED')} className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 border border-slate-200 rounded-sm transition-colors" title="Cancelar Agendamento">
                                                <XCircle size={18} />
                                            </button>
                                            <button onClick={() => updateStatus(a.id, 'NO_SHOW')} className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-800 border border-rose-200 rounded-sm transition-colors" title="Não Compareceu">
                                                <UserX size={18} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
