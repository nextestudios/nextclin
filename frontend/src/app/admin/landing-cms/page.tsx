'use client';

import { useEffect, useState, useCallback } from 'react';
import { Save, RefreshCw, CheckCircle } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const SECTIONS = [
    { key: 'hero', label: '🚀 Hero Section', fields: ['badge', 'title_line1', 'title_line2', 'subtitle', 'cta_primary', 'cta_secondary'] },
    { key: 'features', label: '⚡ Funcionalidades', fields: ['title', 'subtitle'] },
    { key: 'pricing', label: '💳 Preços', fields: ['title', 'subtitle', 'free_price', 'pro_price', 'enterprise_price'] },
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
    const isTextarea = (key: string) => ['subtitle', 'subtitle'].includes(key);

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Landing Page CMS</h1>
                    <p className="text-sm text-gray-400 mt-1">Edite os textos em tempo real — sem redeploy</p>
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
                        <div className="space-y-5">
                            {currentSection.fields.map(field => {
                                const savedKey = `${activeSection}.${field}`;
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
