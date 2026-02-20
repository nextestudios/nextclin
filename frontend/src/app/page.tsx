import * as Icons from 'lucide-react';
import Link from 'next/link';
import { createElement } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getLandingData() {
  try {
    const [cmsRes, plansRes] = await Promise.all([
      fetch(`${API}/admin/landing-cms`, { cache: 'no-store' }),
      fetch(`${API}/public/plans`, { cache: 'no-store' })
    ]);
    const cms = cmsRes.ok ? await cmsRes.json() : null;
    const plans = plansRes.ok ? await plansRes.json() : [];
    return { cms, plans };
  } catch {
    return { cms: null, plans: [] };
  }
}

const DEFAULT_FEATURE_LIST = [
  { icon: 'Calendar', title: 'Agendamento Inteligente', desc: 'Online, domiciliar e presencial com bloqueio de horários e fila de espera' },
  { icon: 'Syringe', title: 'Controle de Vacinas', desc: 'Lotes, validades, cadeia de frio e alertas automáticos de reposição' },
  { icon: 'Shield', title: 'LGPD e Segurança', desc: 'Termos de consentimento, RBAC, MFA e auditoria completa' },
  { icon: 'BarChart3', title: 'Dashboard Assistencial', desc: 'Cobertura vacinal, taxa de no-show e tendências mensais' },
  { icon: 'Smartphone', title: 'WhatsApp Integrado', desc: 'Lembretes automáticos, próxima dose e confirmação de presença' },
  { icon: 'Users', title: 'Multi-tenant', desc: 'Cada clínica isolada, múltiplas unidades e profissionais por tenant' },
];

export default async function LandingPage() {
  const { cms, plans } = await getLandingData();
  const hero = cms?.hero || {};
  const pricing = cms?.pricing || {};
  const cta = cms?.cta || {};
  const features = cms?.features || {};

  let featureList = DEFAULT_FEATURE_LIST;
  if (features.features_list) {
    try {
      featureList = JSON.parse(features.features_list);
      if (!Array.isArray(featureList) || featureList.length === 0) {
        featureList = DEFAULT_FEATURE_LIST;
      }
    } catch {
      // Use fallback
    }
  }

  // Pre-process plans to map to our UI
  const displayPlans = plans.map((p: any) => ({
    name: p.name,
    price: p.price === 0 ? 'R$ 0' : `R$ ${p.price}`,
    period: '/mês',
    popular: p.plan === 'PRO',
    features: p.features || [],
  }));

  // Render dynamic icon from Lucide
  const RenderIcon = ({ name, className, size = 20 }: { name: string, className?: string, size?: number }) => {
    const IconComponent = (Icons as any)[name] || Icons.Star;
    return createElement(IconComponent, { size, className });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-blue-600/10" />
        <nav className="relative max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.Syringe className="text-teal-400" size={28} />
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
            <Icons.Zap size={14} /> {hero.badge || 'SaaS para Clínicas de Vacinação'}
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
              {hero.cta_primary || 'Começar grátis'} <Icons.ArrowRight size={18} />
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
          {featureList.map(f => (
            <div key={f.title} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-teal-500/30 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-teal-600/20 flex items-center justify-center mb-4 group-hover:bg-teal-600/30 transition">
                <RenderIcon name={f.icon} className="text-teal-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">{pricing.title || 'Planos que cabem no seu bolso'}</h2>
          <p className="text-slate-400">{pricing.subtitle || 'Comece grátis, escale quando precisar.'}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {displayPlans.map((plan: any) => (
            <div key={plan.name} className={`rounded-xl p-8 transition-all flex flex-col ${plan.popular
              ? 'bg-gradient-to-b from-teal-600/20 to-slate-800 border-2 border-teal-500 shadow-lg shadow-teal-500/10 relative'
              : 'bg-slate-800/50 border border-slate-700/50 hover:border-slate-600'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                  <Icons.Star size={10} /> Mais popular
                </div>
              )}
              <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-slate-400 text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f: string) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <Icons.Check size={14} className="text-teal-400 flex-shrink-0" /> {f}
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
          {displayPlans.length === 0 && (
            <div className="col-span-3 text-center text-slate-500 py-10">
              Nenhum plano configurado no sistema.
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="bg-gradient-to-r from-teal-600/20 to-blue-600/20 border border-teal-500/20 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">{cta.title || 'Sua clínica merece o melhor'}</h2>
          <p className="text-slate-300 mb-8">{cta.subtitle || '14 dias grátis. Sem cartão de crédito. Configure em minutos.'}</p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-500 transition-all hover:shadow-lg hover:shadow-teal-500/25">
            {cta.button || 'Começar agora'} <Icons.ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} NextClin by Next Studios. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
