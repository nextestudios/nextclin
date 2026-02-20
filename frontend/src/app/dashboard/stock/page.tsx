'use client';

import { useState, useEffect } from 'react';
import api from '../../../services/api';

interface Movement {
    id: string;
    type: string;
    reason: string;
    quantity: number;
    notes: string;
    createdAt: string;
    batch?: { lotNumber: string; vaccine?: { name: string } };
}

const reasonLabels: Record<string, string> = {
    PURCHASE: 'Compra', RETURN: 'Devolução', APPLICATION: 'Aplicação',
    LOSS: 'Perda', EXPIRED: 'Vencido', ADJUSTMENT: 'Ajuste',
};

export default function StockPage() {
    const [movements, setMovements] = useState<Movement[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [batches, setBatches] = useState<any[]>([]);
    const [formType, setFormType] = useState<'ENTRY' | 'EXIT'>('ENTRY');
    const [form, setForm] = useState({ batchId: '', quantity: 1, reason: 'PURCHASE', notes: '' });

    const load = () => {
        api.get('/stock/movements').then(r => setMovements(r.data)).catch(console.error);
        api.get('/vaccines/batches').then(r => setBatches(r.data)).catch(console.error);
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const endpoint = formType === 'ENTRY' ? '/stock/entry' : '/stock/exit';
            await api.post(endpoint, form);
            load();
            setShowForm(false);
            setForm({ batchId: '', quantity: 1, reason: 'PURCHASE', notes: '' });
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erro ao registrar movimentação');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Controle de Estoque</h1>
                <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    {showForm ? 'Cancelar' : '+ Nova Movimentação'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 flex gap-4">
                        <button type="button" onClick={() => { setFormType('ENTRY'); setForm({ ...form, reason: 'PURCHASE' }); }}
                            className={`px-4 py-2 rounded-lg font-medium ${formType === 'ENTRY' ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                            ➕ Entrada
                        </button>
                        <button type="button" onClick={() => { setFormType('EXIT'); setForm({ ...form, reason: 'LOSS' }); }}
                            className={`px-4 py-2 rounded-lg font-medium ${formType === 'EXIT' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                            ➖ Saída
                        </button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Lote *</label>
                        <select value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })} required
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black">
                            <option value="">Selecione um lote</option>
                            {batches.map((b: any) => <option key={b.id} value={b.id}>{b.lotNumber} - {b.vaccine?.name || 'Vacina'} (Disp: {b.quantityAvailable})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade *</label>
                        <input type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} required
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Motivo</label>
                        <select value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black">
                            {formType === 'ENTRY' ? (
                                <><option value="PURCHASE">Compra</option><option value="RETURN">Devolução</option><option value="ADJUSTMENT">Ajuste</option></>
                            ) : (
                                <><option value="LOSS">Perda</option><option value="EXPIRED">Vencido</option><option value="ADJUSTMENT">Ajuste</option></>
                            )}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                        <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-black" placeholder="Notas" />
                    </div>
                    <div className="md:col-span-2">
                        <button type="submit" className={`text-white px-6 py-2 rounded-lg transition-colors ${formType === 'ENTRY' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                            Registrar {formType === 'ENTRY' ? 'Entrada' : 'Saída'}
                        </button>
                    </div>
                </form>
            )}

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Tipo</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Lote</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Motivo</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Qtd</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movements.map(m => (
                            <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50">
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${m.type === 'ENTRY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {m.type === 'ENTRY' ? '⬆ Entrada' : '⬇ Saída'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-800">{m.batch?.lotNumber || '-'}</td>
                                <td className="px-4 py-3 text-slate-600">{reasonLabels[m.reason] || m.reason}</td>
                                <td className="px-4 py-3 font-medium text-slate-800">{m.quantity}</td>
                                <td className="px-4 py-3 text-slate-500 text-sm">{new Date(m.createdAt).toLocaleDateString('pt-BR')}</td>
                            </tr>
                        ))}
                        {movements.length === 0 && (
                            <tr><td colSpan={5} className="text-center py-8 text-slate-400">Nenhuma movimentação registrada.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
