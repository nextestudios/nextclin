'use client';

import { useState, useEffect } from 'react';
import api from '../../../services/api';
import {
    ScrollText, Search, Filter, User, Clock,
    AlertCircle, Info, Shield
} from 'lucide-react';

interface AuditEntry {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    userId: string;
    userName?: string;
    details: string;
    createdAt: string;
}

export default function AuditPage() {
    const [logs, setLogs] = useState<AuditEntry[]>([]);
    const [search, setSearch] = useState('');
    const [filterEntity, setFilterEntity] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/audit-logs')
            .then(r => setLogs(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const filtered = logs.filter(log => {
        const matchSearch = !search || log.action.toLowerCase().includes(search.toLowerCase())
            || log.entity.toLowerCase().includes(search.toLowerCase())
            || log.details?.toLowerCase().includes(search.toLowerCase());
        const matchEntity = !filterEntity || log.entity === filterEntity;
        return matchSearch && matchEntity;
    });

    const entities = [...new Set(logs.map(l => l.entity))];

    const actionColors: Record<string, string> = {
        CREATE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        UPDATE: 'bg-blue-50 text-blue-700 border-blue-200',
        DELETE: 'bg-rose-50 text-rose-700 border-rose-200',
        LOGIN: 'bg-teal-50 text-teal-700 border-teal-200',
        STATUS_CHANGE: 'bg-amber-50 text-amber-700 border-amber-200',
    };

    const actionLabels: Record<string, string> = {
        CREATE: 'Criação', UPDATE: 'Atualização', DELETE: 'Exclusão',
        LOGIN: 'Login', STATUS_CHANGE: 'Mudança de Status',
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 saas-card">
                <div className="flex items-center gap-3">
                    <div className="bg-teal-100 p-2 text-teal-700 rounded-sm">
                        <ScrollText size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Auditoria e Logs do Sistema</h1>
                        <p className="text-slate-500 text-sm mt-1">Histórico completo de operações realizadas pelos usuários</p>
                    </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-sm text-xs font-mono font-semibold text-slate-500">
                    {filtered.length} registro(s)
                </div>
            </div>

            {/* Filters */}
            <div className="saas-card p-4 bg-white flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[250px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por ação, entidade ou detalhes..."
                        className="saas-input !pl-10 bg-white"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-slate-400" />
                    <select value={filterEntity} onChange={e => setFilterEntity(e.target.value)} className="saas-input text-sm min-w-[180px]">
                        <option value="">Todas as Entidades</option>
                        {entities.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                </div>
            </div>

            {/* Log Table */}
            <div className="saas-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data/Hora</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ação</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Entidade</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Detalhes</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuário</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400 animate-pulse">
                                        Carregando registros de auditoria...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                                        <Shield size={40} className="mx-auto mb-3 opacity-20" />
                                        <p className="font-medium text-slate-500">Nenhum registro de auditoria encontrado.</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Clock size={14} className="text-slate-400" />
                                                {new Date(log.createdAt).toLocaleString('pt-BR')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-sm border ${actionColors[log.action] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                {actionLabels[log.action] || log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            <span className="font-mono text-sm font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{log.entity}</span>
                                        </td>
                                        <td className="px-6 py-3 text-sm text-slate-600 max-w-xs truncate">{log.details || '—'}</td>
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm">
                                                <User size={14} className="text-slate-400" />
                                                <span className="font-medium text-slate-700">{log.userName || log.userId || '—'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
