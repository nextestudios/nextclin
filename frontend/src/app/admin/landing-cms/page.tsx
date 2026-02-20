'use client';

import { useEffect, useState, useCallback } from 'react';
import { Save, RefreshCw, CheckCircle, Plus, Trash2 } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const SECTIONS = [
    { key: 'hero', label: '🚀 Hero Section', fields: ['badge', 'title_line1', 'title_line2', 'subtitle', 'cta_primary', 'cta_secondary'] },
    { key: 'features', label: '⚡ Funcionalidades', fields: ['title', 'subtitle', 'features_list'] },
    { key: 'pricing', label: '💳 Preços', fields: ['title', 'subtitle'] },
    { key: 'cta', label: '🎯 Call to Action', fields: ['title', 'subtitle', 'button'] },
];

export default function AdminLandingCmsPage() {
    const [config, setConfig] = useState<Record<string, Record<string, string>>>({});
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState<Record<string, boolean>>({});
    const [activeSection, setActiveSection] = useState('hero');

    useEffect(() => {
        fetch(`${API}/admin/landing-cms`)
            .then(r => r.json()).then(setConfig)
            .finally(() => setLoading(false));
    }, []);

    const updateField = (section: string, key: string, value: string) => {
        setConfig(c => ({ ...c, [section]: { ...c[section], [key]: value } }));
    };

    const saveField = useCallback(async (section: string, key: string) => {
        const token = localStorage.getItem('admin_token') || '';
        await fetch(`${API}/admin/landing-cms/${section}/${key}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ value: config[section]?.[key] || '' }),
        });
        setSaved(s => ({ ...s, [`${section}.${key}`]: true }));
        setTimeout(() => setSaved(s => ({ ...s, [`${section}.${key}`]: false })), 2000);
    }, [config]);

    const resetAll = async () => {
        if (!confirm('Resetar landing page para os valores padrão?')) return;
        const token = localStorage.getItem('admin_token') || '';
        const res = await fetch(`${API}/admin/landing-cms/reset`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) {
            const fresh = await fetch(`${API}/admin/landing-cms`).then(r => r.json());
            setConfig(fresh);
        }
    };

    const currentSection = SECTIONS.find(s => s.key === activeSection)!;

    // Features List Dynamic Manager
    const getFeaturesList = () => {
        try {
            return JSON.parse(config.features?.features_list || '[]');
        } catch {
            return [];
        }
    };

    const updateFeaturesList = (newList: any[]) => {
        updateField('features', 'features_list', JSON.stringify(newList));
    };

    const addFeature = () => {
        const list = getFeaturesList();
        updateFeaturesList([...list, { icon: 'Star', title: 'Nova feature', desc: 'Descrição' }]);
    };

    const updateFeature = (index: number, fKey: string, val: string) => {
        const list = getFeaturesList();
        list[index][fKey] = val;
        updateFeaturesList(list);
    };

    const removeFeature = (index: number) => {
        const list = getFeaturesList();
        list.splice(index, 1);
        updateFeaturesList(list);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Landing Page CMS</h1>
                    <p className="text-sm text-gray-400 mt-1">Edite os textos e listas dinâmicas em tempo real</p>
                </div>
                <button onClick={resetAll}
                    className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-500/50 px-3 py-2 rounded-lg transition-all">
                    <RefreshCw size={12} /> Restaurar Padrões
                </button>
            </div>

            <div className="flex gap-6">
                {/* Section Nav */}
                <div className="w-48 flex-shrink-0 space-y-1">
                    {SECTIONS.map(s => (
                        <button key={s.key} onClick={() => setActiveSection(s.key)}
                            className={`w-full text-left text-sm px-3 py-2.5 rounded-lg transition-all ${activeSection === s.key ? 'bg-teal-600/20 text-teal-400 font-medium' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Fields */}
                <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-6">
                    {loading ? (
                        <p className="text-sm text-gray-500 text-center py-8">Carregando configurações...</p>
                    ) : (
                        <div className="space-y-6">
                            {currentSection.fields.map(field => {
                                const savedKey = `${activeSection}.${field}`;

                                if (field === 'features_list') {
                                    const list = getFeaturesList();
                                    return (
                                        <div key={field} className="border-t border-gray-800 pt-6 mt-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <label className="text-sm font-semibold text-white">Lista de Funcionalidades</label>
                                                <button onClick={() => saveField(activeSection, field)}
                                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${saved[savedKey] ? 'bg-green-600/20 text-green-400 border border-green-600/30' : 'bg-teal-600 text-white hover:bg-teal-500'}`}>
                                                    {saved[savedKey] ? <><CheckCircle size={12} /> Salvo</> : <><Save size={12} /> Salvar Lista</>}
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                {list.map((item: any, i: number) => (
                                                    <div key={i} className="flex gap-2 bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 relative group">
                                                        <div className="w-1/4">
                                                            <label className="text-[10px] text-gray-500 block mb-1">Ícone (Nome Lucide)</label>
                                                            <input value={item.icon} onChange={e => updateFeature(i, 'icon', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded text-xs px-2 py-1.5 text-white focus:outline-none focus:border-teal-500" />
                                                        </div>
                                                        <div className="w-1/4">
                                                            <label className="text-[10px] text-gray-500 block mb-1">Título</label>
                                                            <input value={item.title} onChange={e => updateFeature(i, 'title', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded text-xs px-2 py-1.5 text-white focus:outline-none focus:border-teal-500" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[10px] text-gray-500 block mb-1">Descrição</label>
                                                            <input value={item.desc} onChange={e => updateFeature(i, 'desc', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded text-xs px-2 py-1.5 text-white focus:outline-none focus:border-teal-500" />
                                                        </div>
                                                        <button onClick={() => removeFeature(i)} className="absolute -right-2 -top-2 bg-red-500/10 text-red-400 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20">
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button onClick={addFeature} className="w-full py-2 border border-dashed border-gray-700 rounded-lg text-xs text-gray-400 hover:text-teal-400 hover:border-teal-500/50 transition-colors flex items-center justify-center gap-1">
                                                    <Plus size={14} /> Adicionar Funcionalidade
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }

                                const isTa = field === 'subtitle' || field === 'badge';
                                return (
                                    <div key={field}>
                                        <label className="block text-xs text-gray-400 mb-1.5 capitalize">{field.replace(/_/g, ' ')}</label>
                                        <div className="flex gap-2">
                                            {isTa ? (
                                                <textarea
                                                    value={config[activeSection]?.[field] || ''}
                                                    onChange={e => updateField(activeSection, field, e.target.value)}
                                                    rows={3}
                                                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-teal-500 transition-colors" />
                                            ) : (
                                                <input
                                                    value={config[activeSection]?.[field] || ''}
                                                    onChange={e => updateField(activeSection, field, e.target.value)}
                                                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors" />
                                            )}
                                            <button onClick={() => saveField(activeSection, field)}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${saved[savedKey] ? 'bg-green-600/20 text-green-400 border border-green-600/30' : 'bg-teal-600 text-white hover:bg-teal-500'}`}>
                                                {saved[savedKey] ? <><CheckCircle size={12} /> Salvo</> : <><Save size={12} /> Salvar</>}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
