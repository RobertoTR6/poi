'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Settings, Search, Briefcase } from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar() {
    const pathname = usePathname();

    const menuItems = [
        {
            section: 'General', items: [
                { name: 'Dashboard', href: '/', icon: LayoutDashboard },
            ]
        },
        {
            section: 'Normativa', items: [
                { name: 'Normativas', href: '/normativa', icon: FileText },
                { name: 'Búsqueda', href: '/normativa/busqueda', icon: Search },
            ]
        },
        {
            section: 'Convocatorias', items: [
                { name: 'Convocatorias', href: '/convocatorias', icon: Briefcase },
            ]
        },
        {
            section: 'Sistema', items: [
                { name: 'Admin', href: '/admin', icon: Settings },
            ]
        }
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed top-0 left-0 flex flex-col overflow-y-auto">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-blue-600">Rutinas<span className="text-slate-800">App</span></h2>
                <p className="text-xs text-slate-500 mt-1">Gestión Integrada</p>
            </div>

            <nav className="flex-1 px-4 space-y-6">
                {menuItems.map((section, idx) => (
                    <div key={idx}>
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
                            {section.section}
                        </h3>
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={clsx(
                                            'flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium',
                                            isActive
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        )}
                                    >
                                        <Icon size={18} />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <div className="px-4 py-3 bg-blue-50 rounded-xl">
                    <p className="text-xs font-semibold text-blue-600 mb-1">Estado del Sistema</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs text-slate-600">Operativo</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
