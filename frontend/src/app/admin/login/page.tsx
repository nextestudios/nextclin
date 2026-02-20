'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, AlertCircle } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminLoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API}/admin/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Credenciais inválidas.');
            localStorage.setItem('admin_token', data.token);
            localStorage.setItem('admin_user', JSON.stringify(data.user));
            router.replace('/admin');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-xl bg-teal-600/20 border border-teal-600/30 flex items-center justify-center mx-auto mb-4">
                        <Shield size={28} className="text-teal-400" />
                    </div>
                    <h1 className="text-xl font-bold text-white">NextClin Admin</h1>
                    <p className="text-sm text-gray-500 mt-1">Acesso restrito — equipe Next Studios</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1.5">E-mail</label>
                        <input type="email" value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                            placeholder="admin@nextstudios.com.br" required />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1.5">Senha</label>
                        <input type="password" value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                            placeholder="••••••••" required />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5">
                            <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                            <p className="text-xs text-red-400">{error}</p>
                        </div>
                    )}

                    <button type="submit" disabled={loading}
                        className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
                        {loading ? 'Autenticando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}
