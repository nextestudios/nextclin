'use client';

import { useEffect, useState } from 'react';
import { Megaphone, Send, Filter } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminBroadcastsPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [form, setForm] = useState({ channel: 'email', message: '', subject: '', plan: 'ALL', status: 'ALL' });
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('admin_token') || '';
        fetch(`${API}/admin/broadcasts`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(d => setHistory(Array.isArray(d) ? d : []));
    }, []);

    const send = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        const token = localStorage.getItem('admin_token') || '';

        const payload = {
            channel: form.channel,
            message: form.message,
            subject: form.subject,
            filters: {
                ...(form.plan !== 'ALL' && { plan: form.plan }),
                ...(form.status !== 'ALL' && { status: form.status })
            }
        };

        const res = await fetch(`${API}/admin/broadcasts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        setSuccess(data.message);
        setHistory(h => [{ ...payload, id: data.broadcastId, sentAt: new Date() }, ...h]);
        setForm(f => ({ ...f, message: '', subject: '' })); // Keep filters but clear message
        setSending(false);
        setTimeout(() => setSuccess(''), 3000);
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Broadcasts</h1>
                <p className="text-sm text-gray-400 mt-1">Envie mensagens direcionadas aos tenants do SaaS</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><Megaphone size={14} className="text-teal-400" /> Nova Mensagem</h2>
                    <form onSubmit={send} className="space-y-4">
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 space-y-3 mb-4">
                            <h3 className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 mb-2"><Filter size={12} /> Filtros de Audiência</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase tracking-wide mb-1 block">Plano Alvo</label>
                                    <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500">
                                        <option value="ALL">Todos os Planos</option>
                                        <option value="FREE">Apenas FREE</option>
                                        <option value="PRO">Apenas PRO</option>
                                        <option value="ENTERPRISE">Apenas ENTERPRISE</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase tracking-wide mb-1 block">Status</label>
                                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500">
                                        <option value="ALL">Qualquer Status</option>
                                        <option value="ACTIVE">Apenas Ativas</option>
                                        <option value="SUSPENDED">Apenas Suspensas</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 mb-1.5 block">Canal</label>
                            <select value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500">
                                <option value="email">📧 E-mail</option>
                                <option value="whatsapp">💬 WhatsApp</option>
                                <option value="both">📡 Ambos</option>
                            </select>
                        </div>
                        {form.channel !== 'whatsapp' && (
                            <div>
                                <label className="text-xs text-gray-400 mb-1.5 block">Assunto</label>
                                <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                                    placeholder="Manutenção programada..."
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500" />
                            </div>
                        )}
                        <div>
                            <label className="text-xs text-gray-400 mb-1.5 block">Mensagem</label>
                            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                rows={5} required
                                placeholder="Prezados, informamos que..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white resize-none focus:outline-none focus:border-teal-500" />
                        </div>
                        {success && <p className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2">{success}</p>}
                        <button type="submit" disabled={sending}
                            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50">
                            <Send size={14} /> {sending ? 'Enviando...' : 'Enviar Mensagem Segmentada'}
                        </button>
                    </form>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h2 className="text-sm font-semibold mb-4">Histórico</h2>
                    {history.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-8">Nenhum broadcast enviado ainda.</p>
                    ) : (
                        <div className="space-y-3">
                            {history.map((b, i) => (
                                <div key={i} className="border border-gray-800 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex gap-2 items-center">
                                            <span className="text-xs font-medium text-gray-300 capitalize">{b.channel}</span>
                                            {b.filters?.plan && <span className="text-[10px] bg-teal-400/10 text-teal-400 px-1.5 py-0.5 rounded">Plano: {b.filters.plan}</span>}
                                            {b.filters?.status && <span className="text-[10px] bg-purple-400/10 text-purple-400 px-1.5 py-0.5 rounded">Situação: {b.filters.status}</span>}
                                            {(!b.filters || (!b.filters.plan && !b.filters.status)) && <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">Todos</span>}
                                        </div>
                                        <span className="text-xs text-gray-500">{new Date(b.sentAt).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 line-clamp-2 mt-1">{b.message}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
