'use client';

import { useAppContext } from '@/context/AppContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LogOut, User, LayoutDashboard, Settings, FileText } from 'lucide-react';

export default function AppLayout({ children }) {
  const { currentUser, logout } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If not logged in and trying to access protected route
    if (!currentUser && !pathname.startsWith('/login')) {
      router.push('/login');
    }
  }, [currentUser, pathname, router]);

  if (!currentUser) {
    // Render nothing while redirecting
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [];
  if (currentUser.rol === 'admin') {
    navItems.push({ href: '/admin', label: 'Admin Panel', icon: Settings });
  }
  navItems.push({ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard });
  
  if (currentUser.rol === 'monitor') {
    navItems.push({ href: '/evaluaciones', label: 'Mis Asignaciones', icon: FileText });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col hidden md:flex">
        <div className="p-4 bg-slate-950">
          <h1 className="text-xl font-bold tracking-tight text-white">MINSA RIS</h1>
          <p className="text-xs text-slate-400 mt-1">Herramienta de Monitoreo</p>
        </div>
        <nav className="flex-1 py-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`flex items-center px-4 py-3 text-sm font-medium ${active ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 bg-slate-950 flex flex-col gap-2">
           <div className="flex items-center text-sm">
             <User className="mr-2 h-4 w-4 text-slate-400" />
             <span className="truncate">{currentUser.nombre_completo}</span>
           </div>
           <button onClick={handleLogout} className="flex items-center text-sm text-slate-400 hover:text-white mt-2">
             <LogOut className="mr-2 h-4 w-4" />
             Cerrar Sesión
           </button>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center">
          <h1 className="font-bold">MINSA RIS</h1>
          <button onClick={handleLogout}><LogOut className="h-5 w-5"/></button>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
