'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Crown, Check, Zap, Star } from 'lucide-react';
import api from '@/services/api';

interface Plan {
    tier: string;
    name: string;
    price: number;
    features: string[];
    limits: { maxPatients: number; maxUnits: number; maxProfessionals: number };
    popular?: boolean;
}

interface SubscriptionData {
    plan: string;
    status: string;
    maxPatients: number;
    maxUnits: number;
    maxProfessionals: number;
    monthlyPrice: number;
    trialEndsAt?: string;
    currentPeriodEnd?: string;
}

export default function BillingPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/subscription').catch(() => ({ data: null })),
            api.get('/subscription/plans').catch(() => ({ data: [] })),
        ]).then(([sub, plns]) => {
            setSubscription(sub.data);
            setPlans(plns.data);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-slate-400">Carregando planos...</div>;

    const statusLabels: Record<string, { label: string; color: string }> = {
        TRIAL: { label: 'Período de Teste', color: 'bg-blue-100 text-blue-700' },
        ACTIVE: { label: 'Ativo', color: 'bg-emerald-100 text-emerald-700' },
        PAST_DUE: { label: 'Pagamento Pendente', color: 'bg-amber-100 text-amber-700' },
        CANCELLED: { label: 'Cancelado', color: 'bg-rose-100 text-rose-700' },
    };

    const currentStatus = statusLabels[subscription?.status || 'TRIAL'];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Planos e Assinatura</h1>
                <p className="text-slate-500 text-sm mt-1">Gerencie seu plano e billing</p>
            </div>

            {/* Current Plan */}
            {subscription && (
                <div className="saas-card p-6 border-l-4 border-teal-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Crown size={20} className="text-teal-600" />
                                <h3 className="text-lg font-semibold text-slate-900">
                                    Plano {subscription.plan === 'FREE' ? 'Gratuito' : subscription.plan === 'PRO' ? 'Profissional' : 'Enterprise'}
                                </h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${currentStatus.color}`}>
                                    {currentStatus.label}
                                </span>
                            </div>
                            <div className="flex gap-6 text-sm text-slate-500">
                                <span>👥 {subscription.maxPatients >= 99999 ? '∞' : subscription.maxPatients} pacientes</span>
                                <span>🏢 {subscription.maxUnits >= 99 ? '∞' : subscription.maxUnits} unidades</span>
                                <span>👨‍⚕️ {subscription.maxProfessionals >= 99999 ? '∞' : subscription.maxProfessionals} profissionais</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold text-slate-900">
                                R$ {Number(subscription.monthlyPrice).toFixed(2).replace('.', ',')}
                            </p>
                            <p className="text-xs text-slate-400">/mês</p>
                        </div>
                    </div>
                    {subscription.trialEndsAt && (
                        <p className="mt-3 text-xs text-blue-600">
                            ⏰ Teste termina em: {new Date(subscription.trialEndsAt).toLocaleDateString('pt-BR')}
                        </p>
                    )}
                </div>
            )}

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(plan => {
                    const isCurrent = plan.tier === subscription?.plan;
                    return (
                        <div
                            key={plan.tier}
                            className={`saas-card p-6 relative transition-all ${plan.popular ? 'ring-2 ring-teal-600 shadow-lg' : ''} ${isCurrent ? 'bg-teal-50/30' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                                    <Star size={10} /> Mais popular
                                </div>
                            )}
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                                <div className="mt-2">
                                    <span className="text-4xl font-bold text-slate-900">
                                        {plan.price === 0 ? 'Grátis' : `R$ ${plan.price}`}
                                    </span>
                                    {plan.price > 0 && <span className="text-slate-400 text-sm">/mês</span>}
                                </div>
                            </div>
                            <ul className="space-y-2 mb-6">
                                {plan.features.map(f => (
                                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                                        <Check size={14} className="text-teal-600 flex-shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button
                                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${isCurrent
                                        ? 'bg-slate-100 text-slate-400 cursor-default'
                                        : plan.popular
                                            ? 'bg-teal-600 text-white hover:bg-teal-700'
                                            : 'border border-teal-600 text-teal-600 hover:bg-teal-50'
                                    }`}
                                disabled={isCurrent}
                            >
                                {isCurrent ? 'Plano atual' : plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Payment Info */}
            <div className="saas-card p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <CreditCard size={16} className="text-teal-600" /> Método de Pagamento
                </h3>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-7 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center">
                            <Zap size={14} className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700">PIX ou Cartão de Crédito</p>
                            <p className="text-xs text-slate-400">Configure ao fazer upgrade</p>
                        </div>
                    </div>
                    <button className="text-teal-600 text-sm font-medium hover:underline">
                        Configurar
                    </button>
                </div>
            </div>
        </div>
    );
}
