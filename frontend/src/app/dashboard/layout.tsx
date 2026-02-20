'use client';

import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    if (loading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-600 border-t-transparent"></div>
                    <span className="text-slate-500 text-sm font-medium tracking-wide animate-pulse">CARREGANDO WORKSPACE...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <div className="ml-64 flex flex-col min-h-screen">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30">
                    <div className="flex items-center text-sm text-slate-500">
                        <span className="font-medium text-slate-800">Workspace</span>
                        <span className="mx-2">/</span>
                        <span>Visão Geral</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-8 w-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-sm">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
