'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Mail, Smartphone, RefreshCw, Filter, CheckCircle2, XCircle, Clock } from 'lucide-react';
import api from '@/services/api';

interface MessageLog {
    id: string;
    channel: string;
    recipient: string;
    content: string;
    status: string;
    externalId?: string;
    error?: string;
    entityType?: string;
    entityId?: string;
    sentAt?: string;
    createdAt: string;
}

const channelIcons: Record<string, any> = {
    whatsapp: MessageSquare,
    sms: Smartphone,
    email: Mail,
};

const channelLabels: Record<string, string> = {
    whatsapp: 'WhatsApp',
    sms: 'SMS',
    email: 'E-mail',
};

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
    SENT: { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50', label: 'Enviado' },
    FAILED: { icon: XCircle, color: 'text-rose-600 bg-rose-50', label: 'Falhou' },
    PENDING: { icon: Clock, color: 'text-amber-600 bg-amber-50', label: 'Pendente' },
};

export default function NotificationsPage() {
    const [logs, setLogs] = useState<MessageLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [channelFilter, setChannelFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [retrying, setRetrying] = useState<string | null>(null);

    const loadLogs = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (channelFilter) params.set('channel', channelFilter);
        if (statusFilter) params.set('status', statusFilter);

        api.get(`/message-logs?${params.toString()}`)
            .then(r => setLogs(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadLogs(); }, [channelFilter, statusFilter]);

    const handleRetry = async (id: string) => {
        setRetrying(id);
        try {
            await api.post(`/message-logs/${id}/retry`);
            loadLogs();
        } catch (err) { console.error(err); }
        finally { setRetrying(null); }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Notificações</h1>
                    <p className="text-slate-500 text-sm mt-1">Histórico de mensagens enviadas pelo sistema</p>
                </div>
                <button onClick={loadLogs} className="saas-button-secondary flex items-center gap-2">
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Atualizar
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: logs.length, color: 'bg-slate-100 text-slate-700' },
                    { label: 'Enviadas', value: logs.filter(l => l.status === 'SENT').length, color: 'bg-emerald-100 text-emerald-700' },
                    { label: 'Falharam', value: logs.filter(l => l.status === 'FAILED').length, color: 'bg-rose-100 text-rose-700' },
                    { label: 'Pendentes', value: logs.filter(l => l.status === 'PENDING').length, color: 'bg-amber-100 text-amber-700' },
                ].map(s => (
                    <div key={s.label} className={`saas-card p-4 flex items-center justify-between ${s.color} border-0`}>
                        <span className="font-medium text-sm">{s.label}</span>
                        <span className="text-2xl font-bold">{s.value}</span>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-3 items-center">
                <Filter size={16} className="text-slate-400" />
                <select
                    value={channelFilter}
                    onChange={e => setChannelFilter(e.target.value)}
                    className="saas-input text-sm py-1.5 w-40"
                >
                    <option value="">Todos os canais</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">E-mail</option>
                    <option value="sms">SMS</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="saas-input text-sm py-1.5 w-40"
                >
                    <option value="">Todos os status</option>
                    <option value="SENT">Enviado</option>
                    <option value="FAILED">Falhou</option>
                    <option value="PENDING">Pendente</option>
                </select>
            </div>

            {/* Table */}
            <div className="saas-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 text-slate-600 text-left">
                            <th className="p-3 font-medium">Canal</th>
                            <th className="p-3 font-medium">Destinatário</th>
                            <th className="p-3 font-medium">Conteúdo</th>
                            <th className="p-3 font-medium">Status</th>
                            <th className="p-3 font-medium">Data</th>
                            <th className="p-3 font-medium w-16"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-400">Carregando...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-400">Nenhuma notificação encontrada</td></tr>
                        ) : logs.map(log => {
                            const ChannelIcon = channelIcons[log.channel] || MessageSquare;
                            const status = statusConfig[log.status] || statusConfig.PENDING;
                            const StatusIcon = status.icon;
                            return (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <ChannelIcon size={14} className="text-teal-600" />
                                            <span className="font-medium">{channelLabels[log.channel] || log.channel}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-slate-600 font-mono text-xs">{log.recipient}</td>
                                    <td className="p-3 text-slate-500 max-w-xs truncate" title={log.content}>
                                        {log.content.substring(0, 60)}{log.content.length > 60 ? '...' : ''}
                                    </td>
                                    <td className="p-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                            <StatusIcon size={12} />
                                            {status.label}
                                        </span>
                                        {log.error && (
                                            <p className="text-xs text-rose-400 mt-0.5">{log.error.substring(0, 40)}</p>
                                        )}
                                    </td>
                                    <td className="p-3 text-slate-400 text-xs">
                                        {new Date(log.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                    </td>
                                    <td className="p-3">
                                        {log.status === 'FAILED' && (
                                            <button
                                                onClick={() => handleRetry(log.id)}
                                                disabled={retrying === log.id}
                                                className="p-1.5 text-teal-600 hover:bg-teal-50 rounded transition-colors"
                                                title="Reenviar"
                                            >
                                                <RefreshCw size={14} className={retrying === log.id ? 'animate-spin' : ''} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
