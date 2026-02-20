'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, BarChart3, FileText, Megaphone, LogOut, Syringe, Shield } from 'lucide-react';
import Link from 'next/link';

const AdminAuthContext = createContext<any>(null);

export function useAdminAuth() { return useContext(AdminAuthContext); }

const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Command Center' },
    { href: '/admin/tenants', icon: Users, label: 'Clínicas' },
    { href: '/admin/plans', icon: CreditCard, label: 'Planos' },
    { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/admin/landing-cms', icon: FileText, label: 'Landing Page CMS' },
    { href: '/admin/broadcasts', icon: Megaphone, label: 'Broadcasts' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [adminUser, setAdminUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (pathname === '/admin/login') { setLoading(false); return; }
        const token = localStorage.getItem('admin_token');
        const user = localStorage.getItem('admin_user');
        if (!token || !user) { router.replace('/admin/login'); return; }
        setAdminUser(JSON.parse(user));
        setLoading(false);
    }, [pathname, router]);

    const logout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        router.replace('/admin/login');
    };

    if (pathname === '/admin/login') return <>{children}</>;
    if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-gray-400 text-sm">Verificando acesso...</p></div>;

    return (
        <AdminAuthContext.Provider value={{ adminUser, logout }}>
            <div className="flex min-h-screen bg-gray-950 text-white">
                {/* Sidebar */}
                <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col fixed inset-y-0">
                    {/* Logo */}
                    <div className="h-16 flex items-center px-6 border-b border-gray-800 gap-2">
                        <div className="flex items-center gap-2">
                            <Shield size={20} className="text-teal-400" />
                            <span className="font-bold text-sm">NextClin</span>
                            <span className="text-xs bg-teal-600 text-white px-1.5 py-0.5 rounded font-medium">ADMIN</span>
                        </div>
                    </div>
                    {/* Nav */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map(({ href, icon: Icon, label }) => {
                            const active = pathname === href;
                            return (
                                <Link key={href} href={href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${active ? 'bg-teal-600/20 text-teal-400 font-medium' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                                    <Icon size={16} />
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>
                    {/* User + Logout */}
                    <div className="p-4 border-t border-gray-800">
                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800 mb-2">
                            <div className="w-7 h-7 rounded-full bg-teal-600/30 flex items-center justify-center text-xs font-bold text-teal-400">
                                {adminUser?.name?.[0]?.toUpperCase() || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{adminUser?.name || 'Admin'}</p>
                                <p className="text-xs text-gray-500 truncate">{adminUser?.role}</p>
                            </div>
                        </div>
                        <button onClick={logout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                            <LogOut size={13} /> Sair do painel
                        </button>
                    </div>
                </aside>
                {/* Main content */}
                <main className="ml-64 flex-1 overflow-auto">
                    <div className="p-8">{children}</div>
                </main>
            </div>
        </AdminAuthContext.Provider>
    );
}
