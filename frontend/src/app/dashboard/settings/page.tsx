'use client';

import { useState, useEffect } from 'react';
import api from '../../../services/api';
import {
    Settings, Save, Building2, Bell, Shield,
    Mail, Phone, MapPin, CheckCircle2
} from 'lucide-react';

export default function SettingsPage() {
    const [config, setConfig] = useState({
        clinicName: '', cnpj: '', phone: '', email: '',
        address: '', city: '', state: '', zipCode: '',
        appointmentReminderHours: 24,
        enableWhatsApp: false, enableEmailReminders: false,
        defaultPaymentTermDays: 30,
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        api.get('/tenants/config').then(r => setConfig(prev => ({ ...prev, ...r.data }))).catch(() => { });
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put('/tenants/config', config);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) { console.error(err); }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 saas-card">
                <div className="flex items-center gap-3">
                    <div className="bg-teal-100 p-2 text-teal-700 rounded-sm">
                        <Settings size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Configurações da Clínica</h1>
                        <p className="text-slate-500 text-sm mt-1">Dados institucionais, preferências de notificação e regras de negócio</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Dados da Clínica */}
                <div className="saas-card p-8 bg-white">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                        <Building2 size={16} /> Dados Institucionais
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="saas-label">Razão Social / Nome Fantasia</label>
                            <input value={config.clinicName} onChange={e => setConfig({ ...config, clinicName: e.target.value })} className="saas-input" placeholder="Nome da Clínica" />
                        </div>
                        <div>
                            <label className="saas-label">CNPJ</label>
                            <input value={config.cnpj} onChange={e => setConfig({ ...config, cnpj: e.target.value })} className="saas-input font-mono" placeholder="00.000.000/0000-00" />
                        </div>
                        <div>
                            <label className="saas-label">Telefone</label>
                            <input value={config.phone} onChange={e => setConfig({ ...config, phone: e.target.value })} className="saas-input" placeholder="(00) 0000-0000" />
                        </div>
                        <div>
                            <label className="saas-label">E-mail</label>
                            <input type="email" value={config.email} onChange={e => setConfig({ ...config, email: e.target.value })} className="saas-input" placeholder="contato@clinica.com.br" />
                        </div>
                        <div>
                            <label className="saas-label">Endereço</label>
                            <input value={config.address} onChange={e => setConfig({ ...config, address: e.target.value })} className="saas-input" placeholder="Rua, número, complemento" />
                        </div>
                        <div>
                            <label className="saas-label">Cidade</label>
                            <input value={config.city} onChange={e => setConfig({ ...config, city: e.target.value })} className="saas-input" placeholder="São Paulo" />
                        </div>
                        <div>
                            <label className="saas-label">UF</label>
                            <input value={config.state} onChange={e => setConfig({ ...config, state: e.target.value })} maxLength={2} className="saas-input uppercase" placeholder="SP" />
                        </div>
                    </div>
                </div>

                {/* Notificações */}
                <div className="saas-card p-8 bg-white">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                        <Bell size={16} /> Preferências de Notificação
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="saas-label">Antecedência do Lembrete de Agendamento (horas)</label>
                            <input type="number" min="1" max="72" value={config.appointmentReminderHours} onChange={e => setConfig({ ...config, appointmentReminderHours: +e.target.value })} className="saas-input" />
                        </div>
                        <div>
                            <label className="saas-label">Prazo Padrão de Pagamento (dias)</label>
                            <input type="number" min="1" max="90" value={config.defaultPaymentTermDays} onChange={e => setConfig({ ...config, defaultPaymentTermDays: +e.target.value })} className="saas-input" />
                        </div>
                        <div className="flex items-center gap-3 py-2">
                            <input type="checkbox" id="whatsapp" checked={config.enableWhatsApp} onChange={e => setConfig({ ...config, enableWhatsApp: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                            <label htmlFor="whatsapp" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Phone size={14} className="text-emerald-500" /> Ativar lembretes por WhatsApp
                            </label>
                        </div>
                        <div className="flex items-center gap-3 py-2">
                            <input type="checkbox" id="emailReminders" checked={config.enableEmailReminders} onChange={e => setConfig({ ...config, enableEmailReminders: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                            <label htmlFor="emailReminders" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Mail size={14} className="text-blue-500" /> Ativar lembretes por E-mail
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    {saved && (
                        <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium bg-emerald-50 px-4 py-2 rounded-sm border border-emerald-200">
                            <CheckCircle2 size={16} /> Configurações salvas com sucesso!
                        </div>
                    )}
                    <button type="submit" className="saas-button-primary">
                        <Save size={18} /> Salvar Configurações
                    </button>
                </div>
            </form>
        </div>
    );
}
