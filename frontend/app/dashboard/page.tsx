'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { LayoutDashboard, Users, MessageSquare, BarChart3, Settings, LogOut } from 'lucide-react';

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
        if (typeof window !== 'undefined') {
            const token = window.localStorage.getItem('token');
            if (!token) {
                router.push('/');
                return;
            }
            fetchAnalytics(token);
        }
    }, [router]);

    const fetchAnalytics = async (token: string) => {
        try {
            const response = await axios.get(`${API_URL}/api/analytics/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnalytics(response.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem('token');
            window.localStorage.removeItem('user');
        }
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-gray-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 glass-dark p-6 flex flex-col">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        LeadEnforce
                    </h1>
                </div>

                <nav className="flex-1 space-y-2">
                    <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-lg">
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </a>
                    <a href="/campaigns" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg transition-colors">
                        <Users size={20} />
                        <span>Campaigns</span>
                    </a>
                    <a href="/inbox" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg transition-colors">
                        <MessageSquare size={20} />
                        <span>Inbox</span>
                    </a>
                    <a href="/analytics" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg transition-colors">
                        <BarChart3 size={20} />
                        <span>Analytics</span>
                    </a>
                    <a href="/settings" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg transition-colors">
                        <Settings size={20} />
                        <span>Settings</span>
                    </a>
                </nav>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 rounded-lg transition-colors text-red-400"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
                    <p className="text-gray-400">Welcome back! Here's your automation overview.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="glass rounded-xl p-6 animate-fade-in">
                        <div className="text-gray-400 text-sm mb-2">Total Campaigns</div>
                        <div className="text-3xl font-bold">{analytics?.campaigns.total || 0}</div>
                        <div className="text-green-400 text-sm mt-2">
                            {analytics?.campaigns.active || 0} active
                        </div>
                    </div>

                    <div className="glass rounded-xl p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <div className="text-gray-400 text-sm mb-2">Total Leads</div>
                        <div className="text-3xl font-bold">{analytics?.leads.total || 0}</div>
                        <div className="text-blue-400 text-sm mt-2">
                            {analytics?.leads.connected || 0} connected
                        </div>
                    </div>

                    <div className="glass rounded-xl p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <div className="text-gray-400 text-sm mb-2">Acceptance Rate</div>
                        <div className="text-3xl font-bold">{analytics?.rates.acceptance || 0}%</div>
                        <div className="text-purple-400 text-sm mt-2">
                            Reply rate: {analytics?.rates.reply || 0}%
                        </div>
                    </div>

                    <div className="glass rounded-xl p-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <div className="text-gray-400 text-sm mb-2">Today's Actions</div>
                        <div className="text-3xl font-bold">{analytics?.today.total_actions || 0}</div>
                        <div className="text-green-400 text-sm mt-2">
                            {analytics?.today.successful_actions || 0} successful
                        </div>
                    </div>
                </div>

                {/* Funnel Visualization */}
                <div className="glass rounded-xl p-6 mb-8">
                    <h3 className="text-xl font-semibold mb-6">Lead Funnel</h3>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 text-center">
                            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-2">
                                <div className="text-2xl font-bold">{analytics?.leads.total || 0}</div>
                            </div>
                            <div className="text-sm text-gray-400">Total Leads</div>
                        </div>
                        <div className="text-gray-600">→</div>
                        <div className="flex-1 text-center">
                            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-2">
                                <div className="text-2xl font-bold">{analytics?.leads.connected || 0}</div>
                            </div>
                            <div className="text-sm text-gray-400">Connected</div>
                        </div>
                        <div className="text-gray-600">→</div>
                        <div className="flex-1 text-center">
                            <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-4 mb-2">
                                <div className="text-2xl font-bold">{analytics?.leads.replied || 0}</div>
                            </div>
                            <div className="text-sm text-gray-400">Replied</div>
                        </div>
                        <div className="text-gray-600">→</div>
                        <div className="flex-1 text-center">
                            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-2">
                                <div className="text-2xl font-bold">{analytics?.leads.converted || 0}</div>
                            </div>
                            <div className="text-sm text-gray-400">Converted</div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="glass rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all">
                            Create Campaign
                        </button>
                        <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-lg font-semibold hover:bg-white/10 transition-all">
                            Add Social Account
                        </button>
                        <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-lg font-semibold hover:bg-white/10 transition-all">
                            View Reports
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
