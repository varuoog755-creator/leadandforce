'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { LayoutDashboard, Users, MessageSquare, BarChart3, Settings, LogOut } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                router.push('/');
                return;
            }
            setUser(currentUser);
            // Load demo data
            setAnalytics({
                campaigns: { total: 12, active: 5 },
                leads: { total: 1847, connected: 623, replied: 284, converted: 91 },
                rates: { acceptance: 33.7, reply: 15.4, conversion: 4.9 },
                today: { total_actions: 156, successful_actions: 142, failed_actions: 14 }
            });
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    const menuItems = [
        { icon: LayoutDashboard, label: 'Overview', href: '/dashboard', active: true },
        { icon: Users, label: 'Campaigns', href: '/campaigns' },
        { icon: MessageSquare, label: 'Inbox', href: '/inbox' },
        { icon: BarChart3, label: 'Analytics', href: '/analytics' },
        { icon: Settings, label: 'Settings', href: '/settings' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-56 bg-white border-r border-gray-200 p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                    </div>
                    <span className="text-sm font-black tracking-tight">LEADENFORCE</span>
                </div>
                <nav className="space-y-1 flex-1">
                    {menuItems.map((item) => (
                        <a key={item.label} href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${item.active ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'
                                }`}>
                            <item.icon size={16} />
                            <span>{item.label}</span>
                        </a>
                    ))}
                </nav>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 mt-auto text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-10">
                <div className="max-w-6xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                            <p className="text-sm text-gray-400 mt-1">
                                Welcome back, <span className="font-semibold text-gray-700">{user.displayName || user.email}</span>
                            </p>
                        </div>
                        {user.photoURL && (
                            <img src={user.photoURL} alt="Profile" className="w-9 h-9 rounded-full border-2 border-gray-200" referrerPolicy="no-referrer" />
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {[
                            { label: 'Total Campaigns', value: analytics?.campaigns.total || 0, sub: `${analytics?.campaigns.active || 0} Active` },
                            { label: 'Total Leads', value: analytics?.leads.total || 0, sub: `${analytics?.leads.connected || 0} Connected` },
                            { label: 'Acceptance', value: `${analytics?.rates.acceptance || 0}%`, sub: `Reply: ${analytics?.rates.reply || 0}%` },
                            { label: 'Daily Actions', value: analytics?.today.total_actions || 0, sub: `${analytics?.today.successful_actions || 0} Success` },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">{stat.label}</div>
                                <div className="text-3xl font-bold mb-2 tracking-tighter">{stat.value}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.sub}</div>
                            </div>
                        ))}
                    </div>

                    {/* Performance & Actions */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-8">
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-8">Performance Funnel</h3>
                            <div className="space-y-6">
                                {[
                                    { label: 'Sourcing', val: analytics?.leads.total || 0, color: 'bg-gray-300' },
                                    { label: 'Connecting', val: analytics?.leads.connected || 0, color: 'bg-blue-500' },
                                    { label: 'Engaging', val: analytics?.leads.replied || 0, color: 'bg-purple-500' },
                                    { label: 'Converting', val: analytics?.leads.converted || 0, color: 'bg-green-500' },
                                ].map((item, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                            <span>{item.label}</span>
                                            <span>{item.val} Units</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${item.color} transition-all duration-1000`}
                                                style={{ width: `${Math.min(100, (item.val / (analytics?.leads.total || 1)) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-8">
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-8">Control Deck</h3>
                            <div className="space-y-3">
                                <button className="w-full text-xs uppercase tracking-widest font-black py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">New Campaign</button>
                                <button className="w-full text-xs uppercase tracking-widest font-black py-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Integration</button>
                                <button className="w-full text-xs uppercase tracking-widest font-black py-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Reports</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
