'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import {
    LayoutDashboard, Users, MessageSquare, BarChart3, Settings,
    LogOut, Zap, ChevronRight, Bell, UserCheck, Activity
} from 'lucide-react';

const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
    { icon: Users, label: 'Campaigns', href: '/campaigns' },
    { icon: UserCheck, label: 'Leads', href: '/leads' },
    { icon: MessageSquare, label: 'Inbox', href: '/inbox' },
    { icon: Activity, label: 'Logs', href: '/logs' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                router.push('/');
                return;
            }
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [router]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/');
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
                <div className="text-center">
                    <div className="relative w-12 h-12 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 animate-pulse" />
                        <div className="absolute inset-[3px] rounded-[9px] bg-[#fafafa] flex items-center justify-center">
                            <Zap size={18} className="text-indigo-600 animate-bounce" />
                        </div>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa] flex">
            {/* Sidebar */}
            <aside className={`${sidebarCollapsed ? 'w-[72px]' : 'w-[240px]'} bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out relative`}>
                {/* Collapse Toggle */}
                <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow z-10 cursor-pointer"
                >
                    <ChevronRight size={12} className={`text-gray-400 transition-transform duration-300 ${sidebarCollapsed ? '' : 'rotate-180'}`} />
                </button>

                {/* Logo */}
                <div className={`px-5 py-6 flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200 flex-shrink-0">
                        <Zap size={16} className="text-white" />
                    </div>
                    {!sidebarCollapsed && (
                        <span className="text-sm font-black tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                            LEADENFORCE
                        </span>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <a
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200 group
                                    ${isActive
                                        ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-200'
                                        : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                                    }
                                    ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                                title={sidebarCollapsed ? item.label : undefined}
                            >
                                <item.icon size={16} className={`flex-shrink-0 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                                {!sidebarCollapsed && <span>{item.label}</span>}
                            </a>
                        );
                    })}
                </nav>

                {/* User & Logout */}
                <div className={`p-4 border-t border-gray-100 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
                    {!sidebarCollapsed && (
                        <div className="flex items-center gap-3 mb-3 px-2">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border-2 border-violet-200" referrerPolicy="no-referrer" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-gray-800 truncate">{user.displayName || 'User'}</p>
                                <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all w-full cursor-pointer
                            ${sidebarCollapsed ? 'justify-center' : ''}`}
                        title={sidebarCollapsed ? 'Sign Out' : undefined}
                    >
                        <LogOut size={14} />
                        {!sidebarCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Top Bar */}
                <header className="h-14 bg-white/80 backdrop-blur-lg border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-gray-800 capitalize">
                            {pathname === '/dashboard' ? 'Overview' : pathname.replace('/', '')}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                            <Bell size={16} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
                        </button>
                        {user.photoURL && (
                            <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full border border-gray-200" referrerPolicy="no-referrer" />
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
