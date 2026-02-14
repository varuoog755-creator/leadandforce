'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { LayoutDashboard, Users, MessageSquare, BarChart3, Settings, LogOut, ChevronRight, Activity, Shield } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Analytics {
    campaigns: { total: number; active: number };
    leads: { total: number; connected: number; replied: number; converted: number };
    rates: { acceptance: number; reply: number; conversion: number };
    today: { total_actions: number; successful_actions: number; failed_actions: number };
}

export default function DashboardPage() {
    const router = useRouter();
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load with mock data — no login required
        setAnalytics({
            campaigns: { total: 12, active: 5 },
            leads: { total: 1847, connected: 623, replied: 284, converted: 91 },
            rates: { acceptance: 33.7, reply: 15.4, conversion: 4.9 },
            today: { total_actions: 156, successful_actions: 142, failed_actions: 14 }
        });
        setLoading(false);
    }, []);

    const handleLogout = () => {
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
                <div className="animate-pulse text-xs font-bold uppercase tracking-widest text-secondary">Initializing System...</div>
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
        <div className="min-h-screen flex bg-[#fafafa] dark:bg-black">
            {/* Minimal Sidebar */}
            <aside className="w-64 border-r border-border bg-white dark:bg-black p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-12 px-2">
                    <div className="w-8 h-8 bg-black dark:bg-white rounded flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white dark:text-black" />
                    </div>
                    <span className="font-bold tracking-tight text-lg uppercase">LeadEnforce</span>
                </div>

                <nav className="flex-1 space-y-1">
                    {menuItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${item.active
                                ? 'bg-black text-white dark:bg-white dark:text-black'
                                : 'text-secondary hover:bg-gray-100 dark:hover:bg-white/5'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={16} />
                                <span>{item.label}</span>
                            </div>
                            {item.active && <ChevronRight size={14} />}
                        </a>
                    ))}
                </nav>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 mt-auto text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors"
                >
                    <LogOut size={16} />
                    <span>Terminate Session</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-10 overflow-auto">
                <div className="max-w-6xl mx-auto">
                    <header className="mb-12 flex justify-between items-end">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight mb-1 uppercase">System Overview</h2>
                            <p className="text-xs font-medium text-secondary uppercase tracking-widest">Active Automation Framework</p>
                        </div>
                        <div className="flex items-center gap-3 bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <Activity size={12} className="animate-pulse" />
                            Services Online
                        </div>
                    </header>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {[
                            { label: 'Total Campaigns', value: analytics?.campaigns.total || 0, sub: `${analytics?.campaigns.active || 0} Active` },
                            { label: 'Total Leads', value: analytics?.leads.total || 0, sub: `${analytics?.leads.connected || 0} Connected` },
                            { label: 'Acceptance', value: `${analytics?.rates.acceptance || 0}%`, sub: `Reply: ${analytics?.rates.reply || 0}%` },
                            { label: 'Daily Actions', value: analytics?.today.total_actions || 0, sub: `${analytics?.today.successful_actions || 0} Success` },
                        ].map((stat, i) => (
                            <div key={i} className="min-panel p-6 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="text-[10px] font-black uppercase tracking-widest text-secondary mb-3">{stat.label}</div>
                                <div className="text-3xl font-bold mb-2 tracking-tighter">{stat.value}</div>
                                <div className="text-[10px] font-bold text-secondary uppercase tracking-wider">{stat.sub}</div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Funnel Section */}
                        <div className="lg:col-span-2 min-panel p-8">
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-8">Performance Funnel</h3>
                            <div className="space-y-6">
                                {[
                                    { label: 'Sourcing', val: analytics?.leads.total || 0, color: 'bg-gray-200 dark:bg-zinc-800' },
                                    { label: 'Connecting', val: analytics?.leads.connected || 0, color: 'bg-blue-500' },
                                    { label: 'Engaging', val: analytics?.leads.replied || 0, color: 'bg-purple-500' },
                                    { label: 'Converting', val: analytics?.leads.converted || 0, color: 'bg-green-500' },
                                ].map((item, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                            <span>{item.label}</span>
                                            <span>{item.val} Units</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${item.color} transition-all duration-1000`}
                                                style={{ width: `${Math.min(100, (item.val / (analytics?.leads.total || 1)) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="min-panel p-8">
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-8">Control Deck</h3>
                            <div className="space-y-3">
                                <button className="min-button w-full text-xs uppercase tracking-widest font-black py-4">New Campaign</button>
                                <button className="w-full text-xs uppercase tracking-widest font-black py-4 border border-border rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Integration</button>
                                <button className="w-full text-xs uppercase tracking-widest font-black py-4 border border-border rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Reports</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
