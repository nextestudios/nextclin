'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
    Activity, Users, Calendar, Stethoscope, Syringe,
    PackageSearch, DollarSign, FileText, UserPlus,
    Building2, MapPin, LogOut
} from 'lucide-react';

const menuGroups = [
    {
        title: 'Clínica',
        items: [
            { label: 'Dashboard', href: '/dashboard', icon: Activity },
            { label: 'Pacientes', href: '/dashboard/patients', icon: Users },
            { label: 'Agenda', href: '/dashboard/appointments', icon: Calendar },
            { label: 'Atendimento', href: '/dashboard/attendance', icon: Stethoscope },
        ]
    },
    {
        title: 'Gestão',
        items: [
            { label: 'Vacinas', href: '/dashboard/vaccines', icon: Syringe },
            { label: 'Estoque', href: '/dashboard/stock', icon: PackageSearch },
            { label: 'Profissionais', href: '/dashboard/professionals', icon: UserPlus },
            { label: 'Convênios', href: '/dashboard/insurances', icon: Building2 },
        ]
    },
    {
        title: 'Financeiro',
        items: [
            { label: 'Faturamento', href: '/dashboard/financial', icon: DollarSign },
            { label: 'NFSe', href: '/dashboard/nfse', icon: FileText },
        ]
    },
    {
        title: 'Sistema',
        items: [
            { label: 'Unidades', href: '/dashboard/units', icon: MapPin },
        ]
    }
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
            {/* Header / Logo */}
            <div className="p-6 border-b border-white/5 flex items-center gap-3">
                <div className="bg-teal-600 p-2 rounded-sm text-white">
                    <Activity size={24} strokeWidth={2.5} />
                </div>
                <div>
                    <h1 className="font-bold text-xl text-white tracking-tight">
                        NextClin
                    </h1>
                    <p className="text-xs text-slate-400 truncate w-36" title={user?.name}>{user?.name || 'Administrador'}</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-700">
                {menuGroups.map((group, groupIdx) => (
                    <div key={groupIdx}>
                        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
                            {group.title}
                        </h2>
                        <ul className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href;
                                const Icon = item.icon;
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-colors ${isActive
                                                ? 'bg-teal-900/40 text-teal-400 border-l-2 border-teal-500 -ml-[2px] pr-[2px]'
                                                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                                                }`}
                                        >
                                            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                            <span>{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-white/5">
                <button
                    onClick={signOut}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-sm transition-colors"
                >
                    <LogOut size={18} />
                    <span>Sair do sistema</span>
                </button>
            </div>
        </aside>
    );
}
