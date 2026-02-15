'use client';

import { useState, useEffect } from 'react';
import {
    Users, Search, Filter, ExternalLink, ChevronDown, Loader2,
    UserCheck, UserX, MessageSquare, Clock, Star, TrendingUp
} from 'lucide-react';
import { fetchCampaigns } from '../../lib/api';

interface Lead {
    id: string;
    name: string;
    title: string;
    company: string;
    location: string;
    profile_url: string;
    status: string;
    campaign_name: string;
    platform: string;
    last_contacted_at: string | null;
    created_at: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
    pending: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' },
    contacted: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-400' },
    connected: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400' },
    replied: { bg: 'bg-violet-50', text: 'text-violet-600', dot: 'bg-violet-400' },
    converted: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400' },
    rejected: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400' },
    error: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400' },
};

const DEMO_LEADS: Lead[] = [
    { id: '1', name: 'Sarah Chen', title: 'VP of Engineering', company: 'TechFlow Inc.', location: 'San Francisco, CA', profile_url: '#', status: 'connected', campaign_name: 'Tech Founders Q1', platform: 'linkedin', last_contacted_at: '2025-02-14T10:30:00Z', created_at: '2025-02-10T08:00:00Z' },
    { id: '2', name: 'James Rodriguez', title: 'CTO', company: 'DataVerse AI', location: 'Austin, TX', profile_url: '#', status: 'replied', campaign_name: 'Tech Founders Q1', platform: 'linkedin', last_contacted_at: '2025-02-13T14:22:00Z', created_at: '2025-02-09T12:00:00Z' },
    { id: '3', name: 'Emily Watson', title: 'Head of Growth', company: 'ScaleUp Labs', location: 'New York, NY', profile_url: '#', status: 'contacted', campaign_name: 'SaaS Decision Makers', platform: 'linkedin', last_contacted_at: '2025-02-12T09:15:00Z', created_at: '2025-02-08T10:00:00Z' },
    { id: '4', name: 'Michael Park', title: 'Founder & CEO', company: 'NexGen Solutions', location: 'Seattle, WA', profile_url: '#', status: 'converted', campaign_name: 'Tech Founders Q1', platform: 'linkedin', last_contacted_at: '2025-02-11T16:45:00Z', created_at: '2025-02-07T14:00:00Z' },
    { id: '5', name: 'Lisa Thompson', title: 'Marketing Director', company: 'BrandPulse', location: 'Chicago, IL', profile_url: '#', status: 'pending', campaign_name: 'SaaS Decision Makers', platform: 'linkedin', last_contacted_at: null, created_at: '2025-02-06T11:30:00Z' },
    { id: '6', name: 'David Kim', title: 'Product Manager', company: 'CloudBase', location: 'Denver, CO', profile_url: '#', status: 'connected', campaign_name: 'SaaS Decision Makers', platform: 'linkedin', last_contacted_at: '2025-02-10T13:00:00Z', created_at: '2025-02-05T09:00:00Z' },
    { id: '7', name: 'Anna Müller', title: 'Co-Founder', company: 'FinEdge', location: 'Berlin, DE', profile_url: '#', status: 'rejected', campaign_name: 'Tech Founders Q1', platform: 'linkedin', last_contacted_at: '2025-02-09T11:20:00Z', created_at: '2025-02-04T08:00:00Z' },
    { id: '8', name: 'Raj Patel', title: 'Engineering Lead', company: 'InfraStack', location: 'London, UK', profile_url: '#', status: 'contacted', campaign_name: 'IG Growth Campaign', platform: 'instagram', last_contacted_at: '2025-02-08T10:10:00Z', created_at: '2025-02-03T16:00:00Z' },
    { id: '9', name: 'Maria Garcia', title: 'Sales VP', company: 'LeadMagnet Pro', location: 'Miami, FL', profile_url: '#', status: 'replied', campaign_name: 'SaaS Decision Makers', platform: 'linkedin', last_contacted_at: '2025-02-07T15:30:00Z', created_at: '2025-02-02T12:00:00Z' },
    { id: '10', name: 'Tom Anderson', title: 'CEO', company: 'GreenTech Solutions', location: 'Portland, OR', profile_url: '#', status: 'pending', campaign_name: 'FB Retargeting', platform: 'facebook', last_contacted_at: null, created_at: '2025-02-01T09:00:00Z' },
];

export default function LeadsPage() {
    const [mounted, setMounted] = useState(false);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLive, setIsLive] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [platformFilter, setPlatformFilter] = useState('all');

    useEffect(() => {
        setMounted(true);
        loadLeads();
    }, []);

    const loadLeads = async () => {
        try {
            const res = await fetchCampaigns();
            if (res.data) {
                const campaigns = Array.isArray(res.data) ? res.data : res.data.campaigns || [];
                // For each campaign, fetch leads and combine
                const allLeads: Lead[] = [];
                for (const campaign of campaigns) {
                    try {
                        const { fetchLeads } = await import('../../lib/api');
                        const leadRes = await fetchLeads(campaign.id);
                        const campaignLeads = Array.isArray(leadRes.data) ? leadRes.data : leadRes.data?.leads || [];
                        campaignLeads.forEach((l: any) => {
                            allLeads.push({ ...l, campaign_name: campaign.name, platform: campaign.platform });
                        });
                    } catch { /* skip failed campaign */ }
                }
                if (allLeads.length > 0) {
                    setLeads(allLeads);
                    setIsLive(true);
                    setPageLoading(false);
                    return;
                }
            }
        } catch (err) {
            console.log('API unavailable, using demo data');
        }
        setLeads(DEMO_LEADS);
        setPageLoading(false);
    };

    const filteredLeads = leads.filter(l => {
        const matchesSearch = !search ||
            l.name?.toLowerCase().includes(search.toLowerCase()) ||
            l.company?.toLowerCase().includes(search.toLowerCase()) ||
            l.title?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
        const matchesPlatform = platformFilter === 'all' || l.platform === platformFilter;
        return matchesSearch && matchesStatus && matchesPlatform;
    });

    const stats = {
        total: leads.length,
        connected: leads.filter(l => l.status === 'connected').length,
        replied: leads.filter(l => l.status === 'replied').length,
        converted: leads.filter(l => l.status === 'converted').length,
    };

    if (!mounted) return null;

    return (
        <div className={`max-w-7xl transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Leads</h1>
                        <p className="text-sm text-gray-400 mt-1">All prospects across your campaigns</p>
                    </div>
                    {!isLive && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                            Demo Data
                        </span>
                    )}
                </div>
            </div>

            {/* Loading State */}
            {pageLoading ? (
                <div className="flex items-center justify-center py-32">
                    <div className="text-center">
                        <Loader2 size={24} className="animate-spin text-violet-500 mx-auto mb-3" />
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Loading leads...</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {[
                            { label: 'Total Leads', value: stats.total, icon: Users, gradient: 'from-blue-500 to-cyan-500' },
                            { label: 'Connected', value: stats.connected, icon: UserCheck, gradient: 'from-emerald-500 to-teal-500' },
                            { label: 'Replied', value: stats.replied, icon: MessageSquare, gradient: 'from-violet-500 to-purple-500' },
                            { label: 'Converted', value: stats.converted, icon: Star, gradient: 'from-amber-500 to-orange-500' },
                        ].map((s, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-sm`}>
                                        <s.icon size={18} className="text-white" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search leads by name, company, or title..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 text-xs font-semibold border border-gray-200 rounded-xl bg-white text-gray-600 focus:outline-none focus:border-violet-300 cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="contacted">Contacted</option>
                            <option value="connected">Connected</option>
                            <option value="replied">Replied</option>
                            <option value="converted">Converted</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <select
                            value={platformFilter}
                            onChange={(e) => setPlatformFilter(e.target.value)}
                            className="px-3 py-2 text-xs font-semibold border border-gray-200 rounded-xl bg-white text-gray-600 focus:outline-none focus:border-violet-300 cursor-pointer"
                        >
                            <option value="all">All Platforms</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="instagram">Instagram</option>
                            <option value="facebook">Facebook</option>
                        </select>
                    </div>

                    {/* Leads Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Lead</th>
                                    <th className="text-left px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Company</th>
                                    <th className="text-left px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Campaign</th>
                                    <th className="text-left px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</th>
                                    <th className="text-left px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Platform</th>
                                    <th className="text-left px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Last Contact</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeads.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-16">
                                            <UserX size={32} className="mx-auto text-gray-300 mb-3" />
                                            <p className="text-sm font-semibold text-gray-400">No leads found</p>
                                            <p className="text-xs text-gray-300 mt-1">Try adjusting your filters</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLeads.map((lead, i) => {
                                        const statusStyle = STATUS_COLORS[lead.status] || STATUS_COLORS.pending;
                                        return (
                                            <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors" style={{ animationDelay: `${i * 50}ms` }}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                            {(lead.name || '?')[0].toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-gray-800 truncate">{lead.name || 'Unknown'}</p>
                                                            <p className="text-[11px] text-gray-400 truncate">{lead.title || 'No title'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <p className="text-xs font-semibold text-gray-700 truncate max-w-[140px]">{lead.company || '—'}</p>
                                                    <p className="text-[10px] text-gray-400 truncate">{lead.location || ''}</p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <p className="text-xs font-semibold text-gray-600 truncate max-w-[140px]">{lead.campaign_name}</p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyle.bg} ${statusStyle.text}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                                                        {lead.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{lead.platform}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-xs text-gray-500">
                                                        {lead.last_contacted_at
                                                            ? new Date(lead.last_contacted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                                            : '—'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 px-2">
                        <p className="text-xs text-gray-400">
                            Showing {filteredLeads.length} of {leads.length} leads
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
