'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) throw new Error('Erro ao processar solicitação');
            setSent(true);
        } catch {
            setError('Não foi possível processar sua solicitação. Verifique o e-mail e tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-teal-700 rounded-sm mx-auto flex items-center justify-center mb-4">
                        <Mail size={28} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recuperar Senha</h1>
                    <p className="text-slate-500 text-sm mt-2">Informe seu e-mail cadastrado para receber o link de redefinição</p>
                </div>

                <div className="saas-card p-8 bg-white">
                    {sent ? (
                        <div className="text-center py-4">
                            <CheckCircle size={48} className="mx-auto text-emerald-500 mb-4" />
                            <h2 className="text-lg font-bold text-slate-900 mb-2">E-mail enviado!</h2>
                            <p className="text-sm text-slate-500 mb-6">
                                Se o e-mail <span className="font-semibold text-slate-700">{email}</span> estiver cadastrado,
                                você receberá um link para redefinir sua senha em instantes.
                            </p>
                            <Link href="/login" className="saas-button-primary inline-flex items-center gap-2">
                                <ArrowLeft size={18} /> Voltar para o Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="flex items-center gap-2 bg-rose-50 text-rose-700 text-sm p-3 rounded-sm border border-rose-200">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}
                            <div>
                                <label className="saas-label">E-mail Cadastrado</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    placeholder="nome@clinica.com.br"
                                    className="saas-input"
                                    autoFocus
                                />
                            </div>
                            <button type="submit" disabled={loading} className="w-full saas-button-primary justify-center disabled:opacity-60">
                                {loading ? 'Enviando...' : <><Send size={18} /> Enviar Link de Recuperação</>}
                            </button>
                            <div className="text-center">
                                <Link href="/login" className="text-sm text-teal-600 hover:text-teal-800 font-medium flex items-center justify-center gap-1">
                                    <ArrowLeft size={14} /> Voltar para o Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
