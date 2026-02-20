'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    // Show nothing while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-500">Carregando...</p>
                </div>
            </div>
        );
    }

    // Not authenticated → redirect happens in useEffect
    if (!isAuthenticated) {
        return null;
    }

    // Check role access if specified
    if (allowedRoles && allowedRoles.length > 0 && user) {
        if (!allowedRoles.includes(user.role)) {
            return (
                <div className="flex items-center justify-center h-screen bg-slate-100">
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
                        <div className="text-5xl mb-4">🚫</div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Acesso Negado</h2>
                        <p className="text-slate-500">Você não tem permissão para acessar esta página.</p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Voltar ao Dashboard
                        </button>
                    </div>
                </div>
            );
        }
    }

    return <>{children}</>;
}
