'use client';

import { useState, useEffect } from 'react';
import api from '../services/api';
import {
    ThermometerSnowflake, Shield, ClipboardList, Syringe,
    Droplet, Trash2, FileSignature, Pill,
    Home, X, CheckCircle2, Circle, Check
} from 'lucide-react';
import { ReactNode } from 'react';

interface ChecklistItem {
    key: string;
    label: string;
    icon: ReactNode;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
    { key: 'thermalBox', label: 'Câmara Fria / Caixa Térmica', icon: <ThermometerSnowflake size={20} /> },
    { key: 'epiKit', label: 'EPIs (Luvas cirúrgicas, Máscara KN95)', icon: <Shield size={20} /> },
    { key: 'conservationTerm', label: 'Registro de Cadeia de Frio', icon: <ClipboardList size={20} /> },
    { key: 'syringesNeedles', label: 'Insumos de Aplicação (Seringas, Agulhas)', icon: <Syringe size={20} /> },
    { key: 'cottonAlcohol', label: 'Agentes Antissépticos (Álcool 70%)', icon: <Droplet size={20} /> },
    { key: 'wasteBag', label: 'Coletor Perfurocortante / Infectantes', icon: <Trash2 size={20} /> },
    { key: 'consentForm', label: 'Termo de Consentimento Livre e Esclarecido', icon: <FileSignature size={20} /> },
    { key: 'vaccinesLoaded', label: 'Imunobiológicos Acondicionados', icon: <Pill size={20} /> },
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
                const created = await api.post('/home-visit-checklists', { appointmentId });
                setChecklist(created.data);
            }
        } catch {
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
            <div className="bg-white rounded-sm shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
                {/* Header */}
                <div className="bg-slate-900 text-white p-5 border-b-4 border-teal-500">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                            <div className="bg-teal-500/20 p-2 rounded-sm text-teal-400">
                                <Home size={20} />
                            </div>
                            <h2 className="text-lg font-bold tracking-tight">Checklist Operacional de Home Care</h2>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-800 rounded-sm h-1.5 overflow-hidden">
                            <div
                                className="bg-teal-500 h-1.5 transition-all duration-300 ease-in-out"
                                style={{ width: `${(checkedCount / CHECKLIST_ITEMS.length) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs font-mono font-bold text-teal-400">{checkedCount}/{CHECKLIST_ITEMS.length} Itens</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                            <span className="text-sm font-medium tracking-widest uppercase">Consultando Governança</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Checklist items */}
                            <div className="grid gap-2 mb-6">
                                {CHECKLIST_ITEMS.map(item => {
                                    const isChecked = checklist && (checklist as any)[item.key];
                                    return (
                                        <button
                                            key={item.key}
                                            onClick={() => toggleItem(item.key)}
                                            className={`w-full flex items-center gap-4 p-3.5 rounded-sm border transition-all duration-150 text-left group
                                                ${isChecked
                                                    ? 'border-teal-500 bg-teal-50 hover:bg-teal-100/50'
                                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className={`p-1.5 rounded-sm ${isChecked ? 'text-teal-600 bg-teal-100/50' : 'text-slate-400 bg-slate-100 group-hover:text-slate-500 group-hover:bg-slate-200'}`}>
                                                {item.icon}
                                            </div>
                                            <span className={`flex-1 text-sm font-semibold tracking-tight ${isChecked ? 'text-teal-900' : 'text-slate-700'}`}>
                                                {item.label}
                                            </span>
                                            <div className={`${isChecked ? 'text-teal-600' : 'text-slate-300 group-hover:text-slate-400'}`}>
                                                {isChecked ? <CheckCircle2 size={20} className="fill-white" /> : <Circle size={20} />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Notes */}
                            <div className="saas-card p-4 bg-white border border-slate-200">
                                <label className="saas-label mb-2 block">Dossiê da Visita / Intercorrências</label>
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    onBlur={saveNotes}
                                    rows={3}
                                    className="saas-input resize-none"
                                    placeholder="Ex: Condicionamento de lote X comprometido, substituição requerida."
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer fixed */}
                {!loading && (
                    <div className="p-5 bg-white border-t border-slate-200 flex flex-col gap-3">
                        {checklist?.allChecked && (
                            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-sm p-3 flex flex-col items-center justify-center font-medium shadow-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={18} className="text-emerald-600" />
                                    <span className="font-bold tracking-tight">Adequação Regulatória Confirmada</span>
                                </div>
                                {checklist.checkedAt && (
                                    <p className="text-[11px] uppercase tracking-wider text-emerald-600/70 mt-1 font-semibold">
                                        Auditoria do Protocolo em: {new Date(checklist.checkedAt).toLocaleString('pt-BR')}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 saas-button-secondary"
                            >
                                <X size={16} /> Fechar Auditoria
                            </button>
                            {!checklist?.allChecked && (
                                <button
                                    onClick={markAll}
                                    className="flex-1 saas-button-primary bg-slate-800 hover:bg-slate-900 focus:ring-slate-800"
                                >
                                    <Check size={16} /> Atestar Conformidade Total
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
