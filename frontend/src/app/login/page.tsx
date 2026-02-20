'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity, ShieldCheck, Zap, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signIn({ email, password });
        } catch (err) {
            setError('Credenciais inválidas. Verifique os dados informados.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex flex-col flex-1 bg-slate-900 text-white p-12 relative overflow-hidden">
                {/* Abstract corporate geometric background */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex items-center gap-3">
                    <div className="bg-teal-600 p-2.5 rounded-sm">
                        <Activity size={28} strokeWidth={2.5} />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">NextClin</span>
                </div>

                <div className="relative z-10 flex-1 flex flex-col justify-center max-w-lg mt-12">
                    <h1 className="text-4xl font-bold leading-tight mb-6">
                        Gestão clínica eficiente, <span className="text-teal-400">padronizada</span> e <span className="text-teal-400">integrada</span>.
                    </h1>
                    <p className="text-slate-400 text-lg mb-12">
                        O sistema corporativo definitivo para controle de vacinação, prontuários, faturamento e NFSe.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-white/10 p-2 rounded-sm mt-1">
                                <ShieldCheck size={20} className="text-teal-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Alta Disponibilidade</h3>
                                <p className="text-sm text-slate-400">Arquitetura multi-tenant desenhada para operação contínua 24/7.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-white/10 p-2 rounded-sm mt-1">
                                <Zap size={20} className="text-teal-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Processamento Assíncrono</h3>
                                <p className="text-sm text-slate-400">Filas de alta performance para emissão de Notas Fiscais e alertas.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm text-slate-500">
                    &copy; {new Date().getFullYear()} NextEstudios. Todos os direitos reservados.
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative bg-white">
                <div className="w-full max-w-sm">
                    <div className="mb-10 lg:hidden flex items-center gap-3 justify-center">
                        <div className="bg-teal-600 p-2 text-white rounded-sm">
                            <Activity size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-bold text-slate-900 tracking-tight">NextClin</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Acesso ao Sistema</h2>
                        <p className="text-slate-500 mt-2 text-sm">Insira suas credenciais corporativas para continuar.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail corporativo</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="saas-input"
                                placeholder="nome@clinica.com.br"
                                required
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-sm font-medium text-slate-700">Senha</label>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="saas-input"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border-l-2 border-red-500 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-medium py-2.5 px-4 transition-colors flex justify-center items-center gap-2"
                            style={{ borderRadius: '2px' }} // inline as fallback, should use saas-button but explicit is safer here
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Autenticando...</span>
                                </>
                            ) : (
                                <>
                                    <span>Entrar no Workspace</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>

                        <div className="text-center mt-4">
                            <a href="/forgot-password" className="text-sm text-teal-600 hover:text-teal-800 font-medium">
                                Esqueceu sua senha?
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
