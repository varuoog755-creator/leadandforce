'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Users, Search, Filter, ExternalLink, ChevronDown, Loader2,
    UserCheck, UserX, MessageSquare, Clock, Star, TrendingUp,
    Download, ChevronLeft, ChevronRight, Save
} from 'lucide-react';
import { fetchAllLeads, updateLeadStatus, exportLeads } from '../../lib/api';

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

const VALID_STATUSES = ['pending', 'contacted', 'connected', 'replied', 'converted', 'rejected'];

export default function LeadsPage() {
    const [mounted, setMounted] = useState(false);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    // Pagination & Filters
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [platformFilter, setPlatformFilter] = useState('all');

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const loadLeads = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = {
                limit,
                offset: (page - 1) * limit,
            };

            if (debouncedSearch) params.search = debouncedSearch;
            if (statusFilter !== 'all') params.status = statusFilter;
            if (platformFilter !== 'all') params.platform = platformFilter;

            const res = await fetchAllLeads(params);
            if (res.data) {
                setLeads(res.data.leads || []);
                setTotal(res.data.total || 0);
            }
        } catch (err) {
            console.error('Failed to load leads:', err);
        } finally {
            setLoading(false);
        }
    }, [page, limit, debouncedSearch, statusFilter, platformFilter]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) loadLeads();
    }, [mounted, loadLeads]);

    const handleExport = async () => {
        setExporting(true);
        try {
            const params: any = {};
            if (debouncedSearch) params.search = debouncedSearch;
            if (statusFilter !== 'all') params.status = statusFilter;
            if (platformFilter !== 'all') params.platform = platformFilter;

            const response = await exportLeads(params);

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `leads-export-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Export failed:', err);
        } finally {
            setExporting(false);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        // Optimistic update
        const originalLeads = [...leads];
        setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));

        try {
            await updateLeadStatus(id, newStatus);
        } catch (err) {
            console.error('Failed to update status:', err);
            // Revert on failure
            setLeads(originalLeads);
        }
    };

    if (!mounted) return null;

    const totalPages = Math.ceil(total / limit);

    return (
        <div className={`max-w-7xl transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Leads</h1>
                    <p className="text-sm text-gray-400 mt-1">Manage and track your prospects</p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                >
                    {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex flex-wrap items-center gap-4">
                <div className="flex-1 relative min-w-[200px]">
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
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
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
                    onChange={(e) => { setPlatformFilter(e.target.value); setPage(1); }}
                    className="px-3 py-2 text-xs font-semibold border border-gray-200 rounded-xl bg-white text-gray-600 focus:outline-none focus:border-violet-300 cursor-pointer"
                >
                    <option value="all">All Platforms</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                </select>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-[400px]">
                        <div className="text-center">
                            <Loader2 size={24} className="animate-spin text-violet-500 mx-auto mb-3" />
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Loading leads...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/30">
                                    <th className="text-left px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Lead</th>
                                    <th className="text-left px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Company</th>
                                    <th className="text-left px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Campaign</th>
                                    <th className="text-left px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</th>
                                    <th className="text-left px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Platform</th>
                                    <th className="text-left px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Last Contact</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-16">
                                            <UserX size={32} className="mx-auto text-gray-300 mb-3" />
                                            <p className="text-sm font-semibold text-gray-400">No leads found</p>
                                            <p className="text-xs text-gray-300 mt-1">Try adjusting your filters</p>
                                        </td>
                                    </tr>
                                ) : (
                                    leads.map((lead) => {
                                        const statusStyle = STATUS_COLORS[lead.status] || STATUS_COLORS.pending;
                                        return (
                                            <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                            {(lead.name || '?')[0].toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-semibold text-sm text-gray-800 truncate">{lead.name || 'Unknown'}</div>
                                                            <div className="text-[11px] text-gray-400 truncate">{lead.title || 'No title'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="text-xs font-semibold text-gray-700 truncate max-w-[140px]">{lead.company || '—'}</div>
                                                    <div className="text-[10px] text-gray-400 truncate">{lead.location || ''}</div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="text-xs font-semibold text-gray-600 truncate max-w-[140px]">{lead.campaign_name}</div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="relative group">
                                                        <select
                                                            value={lead.status}
                                                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                                            className={`appearance-none cursor-pointer pl-3 pr-8 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-transparent border border-transparent hover:border-gray-200 focus:outline-none focus:border-violet-300 transition-all ${statusStyle.text}`}
                                                            style={{ backgroundColor: statusStyle.bg.replace('bg-', 'var(--tw-bg-opacity, 1) rgb(') }} // trick to match bg
                                                        >
                                                            {VALID_STATUSES.map(s => (
                                                                <option key={s} value={s}>{s}</option>
                                                            ))}
                                                        </select>
                                                        <div className={`absolute left-0 top-0 bottom-0 -z-10 w-full h-full rounded-full opacity-20 ${statusStyle.bg.replace('bg-', 'bg-')}`}></div>
                                                    </div>
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
                    </>
                )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 px-2">
                <p className="text-xs text-gray-400">
                    Showing {leads.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} leads
                </p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-bold text-gray-600 px-2">
                        Page {page} of {totalPages || 1}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || loading || totalPages === 0}
                        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
