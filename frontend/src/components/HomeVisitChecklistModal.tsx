'use client';

import { useState, useEffect } from 'react';
import api from '../services/api';

interface ChecklistItem {
    key: string;
    label: string;
    icon: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
    { key: 'thermalBox', label: 'Caixa Térmica', icon: '🧊' },
    { key: 'epiKit', label: 'Kit EPI (luvas, máscara, óculos)', icon: '🧤' },
    { key: 'conservationTerm', label: 'Termo de Conservação', icon: '📋' },
    { key: 'syringesNeedles', label: 'Seringas e Agulhas', icon: '💉' },
    { key: 'cottonAlcohol', label: 'Algodão e Álcool 70%', icon: '🧴' },
    { key: 'wasteBag', label: 'Saco para Descarte', icon: '🗑️' },
    { key: 'consentForm', label: 'Termo de Consentimento', icon: '📝' },
    { key: 'vaccinesLoaded', label: 'Vacinas Carregadas', icon: '💊' },
];

interface Checklist {
    id: string;
    thermalBox: boolean;
    epiKit: boolean;
    conservationTerm: boolean;
    syringesNeedles: boolean;
    cottonAlcohol: boolean;
    wasteBag: boolean;
    consentForm: boolean;
    vaccinesLoaded: boolean;
    allChecked: boolean;
    checkedBy: string | null;
    checkedAt: string | null;
    notes: string | null;
}

interface Props {
    appointmentId: string;
    onClose: () => void;
}

export default function HomeVisitChecklistModal({ appointmentId, onClose }: Props) {
    const [checklist, setChecklist] = useState<Checklist | null>(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        loadChecklist();
    }, [appointmentId]);

    const loadChecklist = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/home-visit-checklists/appointment/${appointmentId}`);
            if (res.data) {
                setChecklist(res.data);
                setNotes(res.data.notes || '');
            } else {
                // Create new checklist
                const created = await api.post('/home-visit-checklists', { appointmentId });
                setChecklist(created.data);
            }
        } catch {
            // Create new checklist
            try {
                const created = await api.post('/home-visit-checklists', { appointmentId });
                setChecklist(created.data);
            } catch (err) {
                console.error(err);
            }
        }
        setLoading(false);
    };

    const toggleItem = async (field: string) => {
        if (!checklist) return;
        const currentValue = (checklist as any)[field];
        try {
            const res = await api.patch(`/home-visit-checklists/${checklist.id}/toggle`, {
                field,
                value: !currentValue,
            });
            setChecklist(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const markAll = async () => {
        if (!checklist) return;
        try {
            const res = await api.patch(`/home-visit-checklists/${checklist.id}/mark-all`);
            setChecklist(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const saveNotes = async () => {
        if (!checklist) return;
        try {
            await api.patch(`/home-visit-checklists/${checklist.id}`, { notes });
        } catch (err) {
            console.error(err);
        }
    };

    const checkedCount = checklist
        ? CHECKLIST_ITEMS.filter(item => (checklist as any)[item.key]).length
        : 0;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold">🏠 Checklist Domiciliar</h2>
                        <button onClick={onClose} className="text-white/80 hover:text-white text-xl">✕</button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 bg-white/20 rounded-full h-2">
                            <div
                                className="bg-white rounded-full h-2 transition-all duration-300"
                                style={{ width: `${(checkedCount / CHECKLIST_ITEMS.length) * 100}%` }}
                            />
                        </div>
                        <span className="text-sm font-medium">{checkedCount}/{CHECKLIST_ITEMS.length}</span>
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-400">Carregando...</div>
                ) : (
                    <div className="p-5 space-y-3">
                        {/* Checklist items */}
                        {CHECKLIST_ITEMS.map(item => (
                            <button
                                key={item.key}
                                onClick={() => toggleItem(item.key)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 ${checklist && (checklist as any)[item.key]
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className={`flex-1 text-left font-medium ${checklist && (checklist as any)[item.key] ? 'text-green-700' : 'text-slate-700'
                                    }`}>
                                    {item.label}
                                </span>
                                <span className="text-lg">
                                    {checklist && (checklist as any)[item.key] ? '✅' : '⬜'}
                                </span>
                            </button>
                        ))}

                        {/* Notes */}
                        <div className="pt-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                onBlur={saveNotes}
                                rows={2}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                placeholder="Anotações sobre a visita..."
                            />
                        </div>

                        {/* Status */}
                        {checklist?.allChecked && (
                            <div className="bg-green-100 text-green-800 rounded-xl p-3 text-center font-medium">
                                ✅ Checklist completo!
                                {checklist.checkedAt && (
                                    <p className="text-xs text-green-600 mt-1">
                                        Validado em {new Date(checklist.checkedAt).toLocaleString('pt-BR')}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            {!checklist?.allChecked && (
                                <button
                                    onClick={markAll}
                                    className="flex-1 bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition font-medium"
                                >
                                    ✅ Marcar Todos
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-xl hover:bg-slate-200 transition font-medium"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
