import { Check, Syringe, Shield, Users, Calendar, BarChart3, Smartphone, Star, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getCmsConfig() {
  try {
    const res = await fetch(`${API}/admin/landing-cms`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const FEATURE_LIST = [
  { icon: Calendar, title: 'Agendamento Inteligente', desc: 'Online, domiciliar e presencial com bloqueio de horários e fila de espera' },
  { icon: Syringe, title: 'Controle de Vacinas', desc: 'Lotes, validades, cadeia de frio e alertas automáticos de reposição' },
  { icon: Shield, title: 'LGPD e Segurança', desc: 'Termos de consentimento, RBAC, MFA e auditoria completa' },
  { icon: BarChart3, title: 'Dashboard Assistencial', desc: 'Cobertura vacinal, taxa de no-show e tendências mensais' },
  { icon: Smartphone, title: 'WhatsApp Integrado', desc: 'Lembretes automáticos, próxima dose e confirmação de presença' },
  { icon: Users, title: 'Multi-tenant', desc: 'Cada clínica isolada, múltiplas unidades e profissionais por tenant' },
];

export default async function LandingPage() {
  const cms = await getCmsConfig();
  const hero = cms?.hero || {};
  const pricing = cms?.pricing || {};
  const cta = cms?.cta || {};
  const features = cms?.features || {};

  const plans = [
    {
      name: 'Gratuito', price: pricing.free_price || 'R$ 0', period: '/mês',
      features: ['1 unidade', '50 pacientes', '3 profissionais', 'Agendamentos', 'Controle de estoque'],
    },
    {
      name: 'Profissional', price: pricing.pro_price || 'R$ 297', period: '/mês', popular: true,
      features: ['Unidades ilimitadas', 'Pacientes ilimitados', '10 profissionais', 'WhatsApp automático', 'NFSe integrada', 'Portal do Paciente', 'Dashboard assistencial'],
    },
    {
      name: 'Enterprise', price: pricing.enterprise_price || 'R$ 697', period: '/mês',
      features: ['Tudo do Pro', 'Profissionais ilimitados', 'API pública', 'White-label', 'SSO/SAML', 'Gestor de conta dedicado'],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-blue-600/10" />
        <nav className="relative max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Syringe className="text-teal-400" size={28} />
            <span className="text-xl font-bold">NextClin</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-slate-300 hover:text-white transition">Funcionalidades</a>
            <a href="#pricing" className="text-sm text-slate-300 hover:text-white transition">Planos</a>
            <Link href="/login" className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-500 transition">
              Entrar
            </Link>
          </div>
        </nav>
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-32 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-600/20 border border-teal-500/30 rounded-full px-4 py-1.5 text-sm text-teal-300 mb-6">
            <Zap size={14} /> {hero.badge || 'SaaS para Clínicas de Vacinação'}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            {hero.title_line1 || 'Gestão completa para'}<br />
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              {hero.title_line2 || 'clínicas de vacinação'}
            </span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">
            {hero.subtitle || 'Agendamentos, estoque, financeiro, NFSe, notificações automáticas e muito mais.'}
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login" className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-500 transition-all hover:shadow-lg hover:shadow-teal-500/25 flex items-center gap-2">
              {hero.cta_primary || 'Começar grátis'} <ArrowRight size={18} />
            </Link>
            <a href="#pricing" className="border border-slate-600 text-slate-300 px-6 py-3 rounded-lg font-semibold hover:border-slate-400 hover:text-white transition">
              {hero.cta_secondary || 'Ver planos'}
            </a>
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">{features.title || 'Tudo que sua clínica precisa'}</h2>
          <p className="text-slate-400 max-w-lg mx-auto">{features.subtitle || 'Sistema completo para gestão de clínicas de vacinação.'}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURE_LIST.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-teal-500/30 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-teal-600/20 flex items-center justify-center mb-4 group-hover:bg-teal-600/30 transition">
                  <Icon size={20} className="text-teal-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">{pricing.title || 'Planos que cabem no seu bolso'}</h2>
          <p className="text-slate-400">{pricing.subtitle || 'Comece grátis, escale quando precisar.'}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.name} className={`rounded-xl p-8 transition-all ${plan.popular
              ? 'bg-gradient-to-b from-teal-600/20 to-slate-800 border-2 border-teal-500 shadow-lg shadow-teal-500/10 relative'
              : 'bg-slate-800/50 border border-slate-700/50 hover:border-slate-600'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                  <Star size={10} /> Mais popular
                </div>
              )}
              <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-slate-400 text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check size={14} className="text-teal-400 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className={`block w-full text-center py-2.5 rounded-lg text-sm font-medium transition-all ${plan.popular
                ? 'bg-teal-600 text-white hover:bg-teal-500'
                : 'border border-slate-600 text-slate-300 hover:border-teal-500 hover:text-teal-400'}`}>
                {plan.price === 'R$ 0' ? 'Começar grátis' : 'Assinar agora'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="bg-gradient-to-r from-teal-600/20 to-blue-600/20 border border-teal-500/20 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">{cta.title || 'Sua clínica merece o melhor'}</h2>
          <p className="text-slate-300 mb-8">{cta.subtitle || '14 dias grátis. Sem cartão de crédito. Configure em minutos.'}</p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-500 transition-all hover:shadow-lg hover:shadow-teal-500/25">
            {cta.button || 'Começar agora'} <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} NextClin by Next Studios. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
