'use client';

import { useState, useEffect } from 'react';
import api from '../../../services/api';
import {
    Stethoscope, Plus, X, Play,
    CheckCircle2, XCircle, AlertTriangle,
    ChevronRight, ArrowRight
} from 'lucide-react';

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
    HIGH: 'bg-rose-50 text-rose-700 border-rose-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    LOW: 'bg-blue-50 text-blue-700 border-blue-200',
    ELECTIVE: 'bg-slate-100 text-slate-700 border-slate-200',
};

const priorityLabels: Record<string, string> = {
    HIGH: 'Alta Urgência', MEDIUM: 'Normal', LOW: 'Baixa', ELECTIVE: 'Eletiva',
};

const statusLabels: Record<string, string> = {
    WAITING: 'Aguardando Atendimento', IN_PROGRESS: 'Em Sala / Atendendo', COMPLETED: 'Finalizado', CANCELLED: 'Cancelado',
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
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 saas-card">
                <div className="flex items-center gap-3">
                    <div className="bg-teal-100 p-2 text-teal-700 rounded-sm">
                        <Stethoscope size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fila de Atendimento</h1>
                        <p className="text-slate-500 text-sm mt-1">Gestão de fila de espera e andamento da triagem/vacinação</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={showForm ? "saas-button-secondary" : "bg-teal-700 hover:bg-teal-800 text-white font-medium px-4 py-2 rounded-sm inline-flex items-center justify-center gap-2 transition-colors"}
                >
                    {showForm ? <><X size={18} /> Fechar Painel</> : <><Plus size={18} /> Adicionar à Fila</>}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="saas-card p-8 bg-white border-t-4 border-t-teal-600">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">Inserir Paciente na Fila</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="saas-label">Paciente *</label>
                            <select value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} required className="saas-input">
                                <option value="">Busque e selecione um paciente</option>
                                {patients.map(p => <option key={p.id} value={p.id}>{p.name} — {p.cpf || 'Sem CPF'}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="saas-label">Profissional Direcionado (Opcional)</label>
                            <select value={form.professionalId} onChange={e => setForm({ ...form, professionalId: e.target.value })} className="saas-input">
                                <option value="">Atendimento Geral (Primeiro Disponível)</option>
                                {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="saas-label">Prioridade da Ficha</label>
                            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className={`saas-input font-medium ${form.priority === 'HIGH' ? 'text-rose-600' : ''}`}>
                                <option value="ELECTIVE">⏳ Eletiva (Rotina)</option>
                                <option value="LOW">ℹ️ Baixa Prioridade</option>
                                <option value="MEDIUM">🟢 Normal</option>
                                <option value="HIGH">🚨 Alta Urgência</option>
                            </select>
                        </div>
                        <div>
                            <label className="saas-label">Observações / Motivo</label>
                            <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="saas-input" placeholder="Breve relato ou motivo do atendimento..." />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
                        <button type="submit" className="saas-button-primary bg-emerald-600 hover:bg-emerald-700">
                            <ArrowRight size={18} /> Inserir Paciente
                        </button>
                    </div>
                </form>
            )}

            {!showForm && (
                <div className="space-y-4">
                    {queue.length === 0 && (
                        <div className="saas-card p-12 text-center flex flex-col items-center justify-center text-slate-400">
                            <CheckCircle2 size={48} className="opacity-20 mb-4 text-emerald-500" />
                            <p className="font-medium text-lg text-slate-500">A fila de atendimento está vazia no momento.</p>
                            <p className="text-sm mt-1">Todos os pacientes foram atendidos com sucesso.</p>
                        </div>
                    )}

                    {queue.map((a, idx) => (
                        <div key={a.id} className="saas-card p-0 flex items-stretch overflow-hidden group hover:shadow-md transition-shadow">
                            {/* Position & Code Block */}
                            <div className={`p-6 flex flex-col items-center justify-center min-w-[100px] border-r border-slate-100 ${a.priority === 'HIGH' ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-700'}`}>
                                <span className="text-3xl font-black tracking-tighter opacity-80 leading-none mb-2">#{idx + 1}</span>
                                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-sm">
                                    {a.code}
                                </span>
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 p-6 flex flex-col justify-center">
                                <div className="flex items-start justify-between mb-2">
                                    <p className="text-lg font-bold text-slate-900">{a.patient?.name || 'Paciente Desconhecido'}</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-sm border ${priorityColors[a.priority] || ''}`}>
                                            {priorityLabels[a.priority] || a.priority}
                                        </span>
                                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-sm border bg-slate-100 text-slate-600 border-slate-200">
                                            {statusLabels[a.status] || a.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-sm text-slate-500 italic mt-1">
                                    {a.notes ? `"${a.notes}"` : 'Sem observações adicionais para a triagem.'}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="p-6 flex flex-col md:flex-row items-center justify-end gap-3 border-l border-slate-50 bg-white group-hover:bg-slate-50/50 transition-colors min-w-[200px]">
                                {a.status === 'WAITING' && (
                                    <button onClick={() => updateStatus(a.id, 'IN_PROGRESS')} className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded-sm hover:bg-blue-700 transition-colors shadow-sm">
                                        <Play size={16} fill="currentColor" className="opacity-80" /> Iniciar
                                    </button>
                                )}
                                {a.status === 'IN_PROGRESS' && (
                                    <button onClick={() => updateStatus(a.id, 'COMPLETED')} className="w-full flex justify-center items-center gap-2 bg-emerald-600 text-white font-medium px-4 py-2 rounded-sm hover:bg-emerald-700 transition-colors shadow-sm">
                                        <CheckCircle2 size={16} /> Finalizar
                                    </button>
                                )}
                                {(a.status === 'WAITING' || a.status === 'IN_PROGRESS') && (
                                    <button onClick={() => updateStatus(a.id, 'CANCELLED')} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-sm transition-colors" title="Cancelar Atendimento">
                                        <XCircle size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
