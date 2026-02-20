'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../services/api';
import {
    ArrowLeft, User, FileText, Calendar, Syringe, Clock,
    Phone, Mail, MapPin, Shield, Edit, AlertCircle
} from 'lucide-react';

export default function PatientRecordPage() {
    const params = useParams();
    const router = useRouter();
    const [patient, setPatient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'attendances' | 'appointments' | 'vaccines'>('overview');

    useEffect(() => {
        if (params.id) {
            api.get(`/patients/${params.id}`)
                .then(r => setPatient(r.data))
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-slate-400">Carregando prontuário...</div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="text-center py-16">
                <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 text-lg">Paciente não encontrado.</p>
                <button onClick={() => router.push('/dashboard/patients')} className="saas-button-primary mt-4">
                    <ArrowLeft size={18} /> Voltar para Pacientes
                </button>
            </div>
        );
    }

    const allApplications = patient.attendances
        ?.flatMap((a: any) => (a.applications || []).map((app: any) => ({ ...app, attendanceCode: a.code })))
        || [];

    const tabs = [
        { key: 'overview', label: 'Dados Pessoais', icon: User },
        { key: 'attendances', label: `Atendimentos (${patient.attendances?.length || 0})`, icon: FileText },
        { key: 'appointments', label: `Agendamentos (${patient.appointments?.length || 0})`, icon: Calendar },
        { key: 'vaccines', label: `Aplicações (${allApplications.length})`, icon: Syringe },
    ] as const;

    const statusColors: Record<string, string> = {
        WAITING: 'bg-amber-50 text-amber-700 border-amber-200',
        IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
        COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
        REQUESTED: 'bg-amber-50 text-amber-700 border-amber-200',
        CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
        NO_SHOW: 'bg-rose-50 text-rose-700 border-rose-200',
    };

    const statusLabels: Record<string, string> = {
        WAITING: 'Aguardando',
        IN_PROGRESS: 'Em Andamento',
        COMPLETED: 'Concluído',
        CANCELLED: 'Cancelado',
        REQUESTED: 'Solicitado',
        CONFIRMED: 'Confirmado',
        NO_SHOW: 'Não Compareceu',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/dashboard/patients')} className="p-2 border border-slate-200 rounded-sm hover:bg-slate-50 transition-colors">
                        <ArrowLeft size={20} className="text-slate-500" />
                    </button>
                    <div className="bg-teal-100 p-3 rounded-sm text-teal-700">
                        <User size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{patient.name}</h1>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs font-semibold">{patient.prontuario}</span>
                            {patient.cpf && <span>CPF: {patient.cpf}</span>}
                            {patient.birthDate && <span>Nasc: {new Date(patient.birthDate).toLocaleDateString('pt-BR')}</span>}
                        </div>
                    </div>
                </div>
                <button className="saas-button-secondary">
                    <Edit size={18} /> Editar Dados
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-200">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${isActive
                                ? 'border-teal-600 text-teal-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="saas-card p-6">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <User size={16} /> Informações Pessoais
                        </h3>
                        <dl className="space-y-3">
                            {[
                                ['Nome Completo', patient.name],
                                ['CPF', patient.cpf || '—'],
                                ['Data de Nascimento', patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('pt-BR') : '—'],
                                ['Sexo', patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Feminino' : patient.gender || '—'],
                            ].map(([label, value]) => (
                                <div key={label as string} className="flex justify-between py-2 border-b border-slate-50">
                                    <dt className="text-sm text-slate-500">{label}</dt>
                                    <dd className="text-sm font-medium text-slate-900">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    <div className="saas-card p-6">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Phone size={16} /> Contato e Endereço
                        </h3>
                        <dl className="space-y-3">
                            {[
                                ['Telefone', patient.phone || '—', Phone],
                                ['E-mail', patient.email || '—', Mail],
                                ['Endereço', patient.address || '—', MapPin],
                                ['Cidade/UF', patient.city ? `${patient.city}${patient.state ? ' - ' + patient.state : ''}` : '—', MapPin],
                                ['CEP', patient.zipCode || '—', MapPin],
                            ].map(([label, value]) => (
                                <div key={label as string} className="flex justify-between py-2 border-b border-slate-50">
                                    <dt className="text-sm text-slate-500">{label}</dt>
                                    <dd className="text-sm font-medium text-slate-900">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    {(patient.guardianName || patient.guardianCpf) && (
                        <div className="saas-card p-6">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Shield size={16} /> Responsável Legal
                            </h3>
                            <dl className="space-y-3">
                                {[
                                    ['Nome', patient.guardianName || '—'],
                                    ['CPF', patient.guardianCpf || '—'],
                                    ['Telefone', patient.guardianPhone || '—'],
                                ].map(([label, value]) => (
                                    <div key={label as string} className="flex justify-between py-2 border-b border-slate-50">
                                        <dt className="text-sm text-slate-500">{label}</dt>
                                        <dd className="text-sm font-medium text-slate-900">{value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    )}

                    {patient.notes && (
                        <div className="saas-card p-6">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                                Observações Clínicas
                            </h3>
                            <p className="text-sm text-slate-700 leading-relaxed">{patient.notes}</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'attendances' && (
                <div className="space-y-3">
                    {(!patient.attendances || patient.attendances.length === 0) ? (
                        <div className="saas-card p-12 text-center text-slate-400">
                            <FileText size={40} className="mx-auto mb-3 opacity-20" />
                            Nenhum atendimento registrado.
                        </div>
                    ) : (
                        patient.attendances
                            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .map((att: any) => (
                                <div key={att.id} className="saas-card p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-1 rounded">{att.code}</span>
                                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-sm border ${statusColors[att.status] || ''}`}>
                                                {statusLabels[att.status] || att.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-400">
                                            <Clock size={12} />
                                            {new Date(att.createdAt).toLocaleString('pt-BR')}
                                        </div>
                                    </div>
                                    {att.applications?.length > 0 && (
                                        <div className="mt-3 border-t border-slate-100 pt-3">
                                            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Vacinas Aplicadas:</p>
                                            <div className="space-y-1">
                                                {att.applications.map((app: any) => (
                                                    <div key={app.id} className="flex items-center gap-3 text-sm bg-emerald-50/50 px-3 py-2 rounded">
                                                        <Syringe size={14} className="text-emerald-600" />
                                                        <span className="font-medium text-slate-700">Dose {app.doseNumber}</span>
                                                        {app.batch && (
                                                            <span className="text-xs text-slate-500">
                                                                Lote: {app.batch.batchNumber} | Val: {new Date(app.batch.expiryDate).toLocaleDateString('pt-BR')}
                                                            </span>
                                                        )}
                                                        {app.nextDoseDate && (
                                                            <span className="text-xs text-amber-600 font-medium ml-auto">
                                                                Próx. dose: {new Date(app.nextDoseDate).toLocaleDateString('pt-BR')}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {att.notes && <p className="text-xs text-slate-500 mt-2 italic">{att.notes}</p>}
                                </div>
                            ))
                    )}
                </div>
            )}

            {activeTab === 'appointments' && (
                <div className="space-y-3">
                    {(!patient.appointments || patient.appointments.length === 0) ? (
                        <div className="saas-card p-12 text-center text-slate-400">
                            <Calendar size={40} className="mx-auto mb-3 opacity-20" />
                            Nenhum agendamento encontrado.
                        </div>
                    ) : (
                        patient.appointments
                            .sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                            .map((apt: any) => (
                                <div key={apt.id} className="saas-card p-5 flex items-center gap-5">
                                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-sm text-center min-w-[90px]">
                                        <p className="text-lg font-bold text-slate-800">
                                            {new Date(apt.startTime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(apt.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-sm border ${statusColors[apt.status] || ''}`}>
                                                {statusLabels[apt.status] || apt.status}
                                            </span>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-sm ${apt.type === 'HOME' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                                                {apt.type === 'HOME' ? '🏠 Domiciliar' : '🏥 Clínico'}
                                            </span>
                                        </div>
                                        {apt.notes && <p className="text-sm text-slate-500 mt-1">{apt.notes}</p>}
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            )}

            {activeTab === 'vaccines' && (
                <div className="saas-card overflow-hidden">
                    {allApplications.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <Syringe size={40} className="mx-auto mb-3 opacity-20" />
                            Nenhuma aplicação registrada.
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Atendimento</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dose</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lote</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data Aplicação</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Via</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Próx. Dose</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {allApplications
                                    .sort((a: any, b: any) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
                                    .map((app: any) => (
                                        <tr key={app.id} className="hover:bg-slate-50/50">
                                            <td className="px-6 py-3 text-sm font-mono text-slate-600">{app.attendanceCode}</td>
                                            <td className="px-6 py-3 text-sm font-medium text-slate-900">{app.doseNumber}ª dose</td>
                                            <td className="px-6 py-3 text-sm text-slate-600">{app.batch?.batchNumber || '—'}</td>
                                            <td className="px-6 py-3 text-sm text-slate-600">{new Date(app.appliedAt).toLocaleDateString('pt-BR')}</td>
                                            <td className="px-6 py-3 text-sm text-slate-600">{app.applicationRoute || '—'}</td>
                                            <td className="px-6 py-3 text-sm">
                                                {app.nextDoseDate ? (
                                                    <span className="text-amber-600 font-medium">{new Date(app.nextDoseDate).toLocaleDateString('pt-BR')}</span>
                                                ) : (
                                                    <span className="text-slate-400">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}
