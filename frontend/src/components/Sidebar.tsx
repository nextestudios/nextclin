'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Pacientes', href: '/dashboard/patients', icon: '👤' },
    { label: 'Agenda', href: '/dashboard/appointments', icon: '📅' },
    { label: 'Atendimento', href: '/dashboard/attendance', icon: '🏥' },
    { label: 'Vacinas', href: '/dashboard/vaccines', icon: '💉' },
    { label: 'Estoque', href: '/dashboard/stock', icon: '📦' },
    { label: 'Financeiro', href: '/dashboard/financial', icon: '💰' },
    { label: 'NFSe', href: '/dashboard/nfse', icon: '📄' },
    { label: 'Profissionais', href: '/dashboard/professionals', icon: '👩‍⚕️' },
    { label: 'Convênios', href: '/dashboard/insurances', icon: '🏢' },
    { label: 'Unidades', href: '/dashboard/units', icon: '🏛️' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-xl">
            <div className="p-6 border-b border-slate-700">
                <h1 className="font-bold text-xl bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    NextClin
                </h1>
                <p className="text-xs text-slate-400 mt-1">{user?.name}</p>
            </div>

            <nav className="p-4 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${isActive
                                ? 'bg-blue-600/30 text-blue-300 border-l-2 border-blue-400'
                                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="absolute bottom-0 w-full p-4 border-t border-slate-700">
                <button
                    onClick={signOut}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/40 transition-all duration-200 text-sm"
                >
                    🚪 Sair
                </button>
            </div>
        </aside>
    );
}
