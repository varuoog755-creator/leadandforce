'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, Zap, Target, Activity, ArrowUpRight, Clock } from 'lucide-react';

export default function DashboardPage() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Demo data - will be replaced with real API calls when DB is connected
        setAnalytics({
            campaigns: { total: 12, active: 5 },
            leads: { total: 1847, connected: 623, replied: 284, converted: 91 },
            rates: { acceptance: 33.7, reply: 15.4, conversion: 4.9 },
            today: { total_actions: 156, successful_actions: 142, failed_actions: 14 }
        });
    }, []);

    if (!analytics) return null;

    const stats = [
        {
            label: 'Total Campaigns',
            value: analytics.campaigns.total,
            sub: `${analytics.campaigns.active} Active`,
            icon: Target,
            color: 'from-violet-500 to-purple-600',
            shadowColor: 'shadow-violet-200',
            change: '+3',
            up: true
        },
        {
            label: 'Total Leads',
            value: analytics.leads.total.toLocaleString(),
            sub: `${analytics.leads.connected} Connected`,
            icon: Users,
            color: 'from-blue-500 to-cyan-500',
            shadowColor: 'shadow-blue-200',
            change: '+127',
            up: true
        },
        {
            label: 'Acceptance Rate',
            value: `${analytics.rates.acceptance}%`,
            sub: `Reply: ${analytics.rates.reply}%`,
            icon: TrendingUp,
            color: 'from-emerald-500 to-teal-500',
            shadowColor: 'shadow-emerald-200',
            change: '+2.1%',
            up: true
        },
        {
            label: 'Daily Actions',
            value: analytics.today.total_actions,
            sub: `${analytics.today.successful_actions} Success`,
            icon: Activity,
            color: 'from-orange-500 to-amber-500',
            shadowColor: 'shadow-orange-200',
            change: '-8',
            up: false
        },
    ];

    const recentActivity = [
        { action: 'Connection request sent', target: 'Sarah Chen - VP Engineering', platform: 'LinkedIn', time: '2m ago', status: 'success' },
        { action: 'Profile viewed', target: 'James Wilson - CTO', platform: 'LinkedIn', time: '5m ago', status: 'success' },
        { action: 'Message sent', target: 'Emily Davis - Founder', platform: 'LinkedIn', time: '8m ago', status: 'success' },
        { action: 'Connection accepted', target: 'Michael Brown - CEO', platform: 'LinkedIn', time: '12m ago', status: 'success' },
        { action: 'Follow request', target: 'techstartup_io', platform: 'Instagram', time: '15m ago', status: 'pending' },
        { action: 'Connection request failed', target: 'Alex Turner - Director', platform: 'LinkedIn', time: '18m ago', status: 'failed' },
    ];

    return (
        <div className={`max-w-7xl transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard Overview</h1>
                <p className="text-sm text-gray-400 mt-1">Real-time performance across all your automation campaigns</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-default"
                        style={{ animationDelay: `${i * 100}ms` }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} ${stat.shadowColor} shadow-lg flex items-center justify-center`}>
                                <stat.icon size={18} className="text-white" />
                            </div>
                            <span className={`flex items-center gap-1 text-[11px] font-bold ${stat.up ? 'text-emerald-500' : 'text-red-400'}`}>
                                {stat.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {stat.change}
                            </span>
                        </div>
                        <div className="text-2xl font-bold tracking-tight text-gray-900 mb-1">{stat.value}</div>
                        <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{stat.sub}</div>
                    </div>
                ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Funnel */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-800">Performance Funnel</h3>
                        <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Last 30 Days</span>
                    </div>
                    <div className="space-y-5">
                        {[
                            { label: 'Sourced', val: analytics.leads.total, max: analytics.leads.total, color: 'from-gray-300 to-gray-400' },
                            { label: 'Connected', val: analytics.leads.connected, max: analytics.leads.total, color: 'from-blue-400 to-blue-600' },
                            { label: 'Replied', val: analytics.leads.replied, max: analytics.leads.total, color: 'from-violet-400 to-purple-600' },
                            { label: 'Converted', val: analytics.leads.converted, max: analytics.leads.total, color: 'from-emerald-400 to-teal-600' },
                        ].map((item, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-600">{item.label}</span>
                                    <span className="text-xs font-bold text-gray-800">{item.val.toLocaleString()}</span>
                                </div>
                                <div className="h-2.5 w-full bg-gray-50 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000 ease-out`}
                                        style={{ width: `${Math.max(3, (item.val / item.max) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-800 mb-6">Quick Actions</h3>
                    <div className="space-y-3">
                        <a href="/campaigns" className="flex items-center justify-between w-full text-left text-xs font-bold uppercase tracking-wider py-4 px-4 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-violet-200 transition-all duration-200 group">
                            <span>New Campaign</span>
                            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </a>
                        <a href="/settings" className="flex items-center justify-between w-full text-left text-xs font-bold uppercase tracking-wider py-4 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group">
                            <span>Add Account</span>
                            <ArrowUpRight size={14} className="text-gray-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </a>
                        <a href="/analytics" className="flex items-center justify-between w-full text-left text-xs font-bold uppercase tracking-wider py-4 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group">
                            <span>View Reports</span>
                            <ArrowUpRight size={14} className="text-gray-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-800">Recent Activity</h3>
                    <button className="text-[10px] font-semibold text-violet-600 hover:text-violet-800 transition-colors cursor-pointer">View All</button>
                </div>
                <div className="divide-y divide-gray-50">
                    {recentActivity.map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-3 group hover:bg-gray-50/50 -mx-2 px-2 rounded-lg transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.status === 'success' ? 'bg-emerald-400' : item.status === 'failed' ? 'bg-red-400' : 'bg-amber-400'}`} />
                                <div>
                                    <p className="text-xs font-semibold text-gray-700">{item.action}</p>
                                    <p className="text-[11px] text-gray-400">{item.target}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-violet-500 bg-violet-50 px-2 py-0.5 rounded-full">{item.platform}</span>
                                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                                    <Clock size={10} />
                                    {item.time}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
