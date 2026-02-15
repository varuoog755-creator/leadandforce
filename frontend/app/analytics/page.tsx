'use client';

import { useState, useEffect } from 'react';
import {
    TrendingUp, TrendingDown, Users, Target, BarChart3, ArrowUpRight,
    ArrowDownRight, Activity, Calendar, Download, Linkedin, Instagram,
    Facebook, MessageSquare, ThumbsUp, Eye, UserPlus, Zap, Loader2
} from 'lucide-react';
import { fetchDashboardAnalytics } from '../../lib/api';

interface MetricCard {
    label: string;
    value: string;
    change: number;
    icon: any;
    color: string;
    gradient: string;
}

interface ChartDataPoint {
    label: string;
    connections: number;
    messages: number;
    replies: number;
}

interface PlatformStat {
    platform: string;
    icon: any;
    color: string;
    leads: number;
    rate: number;
    actions: number;
}

export default function AnalyticsPage() {
    const [mounted, setMounted] = useState(false);
    const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
    const [isLive, setIsLive] = useState(false);
    const [metrics, setMetrics] = useState<MetricCard[]>([]);
    const [weeklyData, setWeeklyData] = useState<ChartDataPoint[]>([]);
    const [platformStats, setPlatformStats] = useState<PlatformStat[]>([]);
    const [funnelData, setFunnelData] = useState<{ label: string; value: number; pct: number; color: string }[]>([]);
    const [topCampaigns, setTopCampaigns] = useState<{ name: string; leads: number; rate: number; status: string }[]>([]);

    const DEMO_METRICS: MetricCard[] = [
        { label: 'Total Leads', value: '2,847', change: 12.5, icon: Users, color: 'text-blue-500', gradient: 'from-blue-500 to-cyan-500' },
        { label: 'Acceptance Rate', value: '38.2%', change: 5.3, icon: ThumbsUp, color: 'text-emerald-500', gradient: 'from-emerald-500 to-teal-500' },
        { label: 'Reply Rate', value: '24.7%', change: -2.1, icon: MessageSquare, color: 'text-violet-500', gradient: 'from-violet-500 to-purple-500' },
        { label: 'Daily Actions', value: '142', change: 8.9, icon: Zap, color: 'text-amber-500', gradient: 'from-amber-500 to-orange-500' },
    ];
    const DEMO_WEEKLY: ChartDataPoint[] = [
        { label: 'Mon', connections: 45, messages: 32, replies: 12 },
        { label: 'Tue', connections: 52, messages: 38, replies: 18 },
        { label: 'Wed', connections: 48, messages: 42, replies: 15 },
        { label: 'Thu', connections: 61, messages: 45, replies: 22 },
        { label: 'Fri', connections: 55, messages: 36, replies: 19 },
        { label: 'Sat', connections: 28, messages: 18, replies: 8 },
        { label: 'Sun', connections: 22, messages: 14, replies: 6 },
    ];
    const DEMO_PLATFORMS: PlatformStat[] = [
        { platform: 'LinkedIn', icon: Linkedin, color: 'bg-blue-500', leads: 2124, rate: 42.1, actions: 98 },
        { platform: 'Instagram', icon: Instagram, color: 'bg-gradient-to-br from-pink-500 to-purple-600', leads: 512, rate: 31.8, actions: 32 },
        { platform: 'Facebook', icon: Facebook, color: 'bg-blue-600', leads: 211, rate: 28.5, actions: 12 },
    ];
    const DEMO_FUNNEL = [
        { label: 'Sent', value: 2847, pct: 100, color: 'bg-violet-500' },
        { label: 'Accepted', value: 1088, pct: 38.2, color: 'bg-blue-500' },
        { label: 'Replied', value: 703, pct: 24.7, color: 'bg-emerald-500' },
        { label: 'Converted', value: 156, pct: 5.5, color: 'bg-amber-500' },
    ];
    const DEMO_TOP_CAMPAIGNS = [
        { name: 'Tech Founders Q1', leads: 847, rate: 36.8, status: 'active' },
        { name: 'SaaS Decision Makers', leads: 523, rate: 38.4, status: 'active' },
        { name: 'IG Growth Campaign', leads: 156, rate: 26.9, status: 'paused' },
        { name: 'FB Retargeting', leads: 89, rate: 22.1, status: 'completed' },
    ];

    useEffect(() => {
        setMounted(true);
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const res = await fetchDashboardAnalytics();
            if (res.data) {
                const d = res.data;
                // Map API data to card metrics if available
                setMetrics([
                    { label: 'Total Leads', value: (d.leads?.total || 0).toLocaleString(), change: 12.5, icon: Users, color: 'text-blue-500', gradient: 'from-blue-500 to-cyan-500' },
                    { label: 'Acceptance Rate', value: `${d.rates?.acceptance || 0}%`, change: 5.3, icon: ThumbsUp, color: 'text-emerald-500', gradient: 'from-emerald-500 to-teal-500' },
                    { label: 'Reply Rate', value: `${d.rates?.reply || 0}%`, change: -2.1, icon: MessageSquare, color: 'text-violet-500', gradient: 'from-violet-500 to-purple-500' },
                    { label: 'Daily Actions', value: (d.today?.total_actions || 0).toString(), change: 8.9, icon: Zap, color: 'text-amber-500', gradient: 'from-amber-500 to-orange-500' },
                ]);
                if (d.weekly) setWeeklyData(d.weekly);
                else setWeeklyData(DEMO_WEEKLY);
                if (d.platforms) setPlatformStats(d.platforms);
                else setPlatformStats(DEMO_PLATFORMS);
                if (d.funnel) setFunnelData(d.funnel);
                else setFunnelData(DEMO_FUNNEL);
                if (d.topCampaigns) setTopCampaigns(d.topCampaigns);
                else setTopCampaigns(DEMO_TOP_CAMPAIGNS);
                setIsLive(true);
                return;
            }
        } catch (err) {
            console.log('API unavailable, using demo data');
        }
        setMetrics(DEMO_METRICS);
        setWeeklyData(DEMO_WEEKLY);
        setPlatformStats(DEMO_PLATFORMS);
        setFunnelData(DEMO_FUNNEL);
        setTopCampaigns(DEMO_TOP_CAMPAIGNS);
    };

    const maxConnections = Math.max(...(weeklyData.length ? weeklyData.map(d => d.connections) : [1]));

    return (
        <div className={`max-w-7xl transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Analytics</h1>
                        <p className="text-sm text-gray-400 mt-1">Performance insights across all campaigns</p>
                    </div>
                    {!isLive && mounted && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                            Demo Data
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 rounded-xl p-0.5">
                        {[
                            { key: '7d' as const, label: '7D' },
                            { key: '30d' as const, label: '30D' },
                            { key: '90d' as const, label: '90D' },
                        ].map(p => (
                            <button
                                key={p.key}
                                onClick={() => setPeriod(p.key)}
                                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer
                                    ${period === p.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-all cursor-pointer">
                        <Download size={13} />
                        Export
                    </button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {metrics.map((m, i) => {
                    const Icon = m.icon;
                    return (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all duration-300 group">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center shadow-sm`}>
                                    <Icon size={18} className="text-white" />
                                </div>
                                <span className={`flex items-center gap-0.5 text-[11px] font-bold ${m.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {m.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {Math.abs(m.change)}%
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{m.value}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">{m.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {/* Bar Chart */}
                <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">Weekly Activity</h3>
                            <p className="text-[11px] text-gray-400 mt-0.5">Connections, messages & replies</p>
                        </div>
                        <div className="flex items-center gap-4 text-[10px]">
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500" /> Connections</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" /> Messages</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Replies</span>
                        </div>
                    </div>

                    <div className="flex items-end gap-2 h-48">
                        {weeklyData.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full flex items-end gap-[2px] justify-center" style={{ height: '180px' }}>
                                    <div
                                        className="flex-1 bg-gradient-to-t from-violet-500 to-violet-400 rounded-t-md transition-all duration-700 hover:opacity-80"
                                        style={{ height: `${(d.connections / maxConnections) * 100}%`, animationDelay: `${i * 100}ms` }}
                                    />
                                    <div
                                        className="flex-1 bg-gradient-to-t from-blue-400 to-blue-300 rounded-t-md transition-all duration-700 hover:opacity-80"
                                        style={{ height: `${(d.messages / maxConnections) * 100}%` }}
                                    />
                                    <div
                                        className="flex-1 bg-gradient-to-t from-emerald-400 to-emerald-300 rounded-t-md transition-all duration-700 hover:opacity-80"
                                        style={{ height: `${(d.replies / maxConnections) * 100}%` }}
                                    />
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 mt-1">{d.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Conversion Funnel */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Conversion Funnel</h3>
                    <p className="text-[11px] text-gray-400 mb-6">Lead progression pipeline</p>

                    <div className="space-y-4">
                        {funnelData.map((f, i) => (
                            <div key={i}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-semibold text-gray-700">{f.label}</span>
                                    <span className="text-xs font-bold text-gray-900">{f.value.toLocaleString()}</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${f.color} rounded-full transition-all duration-1000`}
                                        style={{ width: `${f.pct}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-gray-400 mt-0.5 block">{f.pct}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-2 gap-4">
                {/* Platform Breakdown */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Platform Performance</h3>
                    <p className="text-[11px] text-gray-400 mb-5">Breakdown by social platform</p>

                    <div className="space-y-4">
                        {platformStats.map((p, i) => {
                            const Icon = p.icon;
                            return (
                                <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                                    <div className={`w-10 h-10 ${p.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                        <Icon size={18} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-gray-900">{p.platform}</p>
                                        <p className="text-[10px] text-gray-400">{p.leads.toLocaleString()} leads · {p.rate}% acceptance</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900">{p.actions}</p>
                                        <p className="text-[10px] text-gray-400">daily actions</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Campaigns Table */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Top Campaigns</h3>
                    <p className="text-[11px] text-gray-400 mb-5">Ranked by lead volume</p>

                    <table className="w-full">
                        <thead>
                            <tr className="text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                                <th className="text-left pb-3">Campaign</th>
                                <th className="text-right pb-3">Leads</th>
                                <th className="text-right pb-3">Rate</th>
                                <th className="text-right pb-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs">
                            {topCampaigns.map((c, i) => (
                                <tr key={i} className="border-b border-gray-50 last:border-0">
                                    <td className="py-3 font-semibold text-gray-900">{c.name}</td>
                                    <td className="py-3 text-right font-bold text-gray-700">{c.leads}</td>
                                    <td className="py-3 text-right">
                                        <span className={c.rate > 30 ? 'text-emerald-500 font-bold' : 'text-gray-500'}>{c.rate}%</span>
                                    </td>
                                    <td className="py-3 text-right">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize
                                            ${c.status === 'active' ? 'bg-emerald-50 text-emerald-600' : ''}
                                            ${c.status === 'paused' ? 'bg-amber-50 text-amber-600' : ''}
                                            ${c.status === 'completed' ? 'bg-blue-50 text-blue-600' : ''}
                                        `}>
                                            {c.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
