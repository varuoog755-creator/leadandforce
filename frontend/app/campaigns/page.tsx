'use client';

import { useState, useEffect } from 'react';
import {
    Plus, Play, Pause, Trash2, X, Loader2, Target, Users, MessageSquare,
    ThumbsUp, Eye, Heart, ChevronDown, BarChart3, Linkedin, Instagram, Facebook,
    ArrowUpRight, CheckCircle2, Zap, Calendar
} from 'lucide-react';

interface Campaign {
    id: string;
    name: string;
    platform: string;
    action_type: string;
    status: string;
    daily_limit: number;
    target_audience_url: string | null;
    personalization_template: string | null;
    account_username: string;
    total_leads: number;
    connected_count: number;
    replied_count: number;
    created_at: string;
}

const platformIcons: Record<string, any> = {
    linkedin: Linkedin,
    instagram: Instagram,
    facebook: Facebook,
};

const platformGradients: Record<string, string> = {
    linkedin: 'from-blue-500 to-blue-700',
    instagram: 'from-pink-500 to-rose-600',
    facebook: 'from-blue-400 to-indigo-600',
};

const actionTypeLabels: Record<string, { label: string; icon: any }> = {
    connect: { label: 'Connection Requests', icon: Users },
    message: { label: 'Direct Messages', icon: MessageSquare },
    like: { label: 'Auto Like', icon: ThumbsUp },
    follow: { label: 'Auto Follow', icon: Plus },
    comment: { label: 'Auto Comment', icon: MessageSquare },
    view_story: { label: 'Story Views', icon: Eye },
};

const statusBadge: Record<string, { label: string; color: string; dot: string }> = {
    active: { label: 'Active', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-400' },
    paused: { label: 'Paused', color: 'text-amber-700 bg-amber-50 border-amber-200', dot: 'bg-amber-400' },
    completed: { label: 'Completed', color: 'text-blue-700 bg-blue-50 border-blue-200', dot: 'bg-blue-400' },
    error: { label: 'Error', color: 'text-red-700 bg-red-50 border-red-200', dot: 'bg-red-400' },
};

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        platform: 'linkedin',
        actionType: 'connect',
        dailyLimit: '30',
        targetAudienceUrl: '',
        personalizationTemplate: '',
        socialAccountId: '',
    });

    useEffect(() => {
        setMounted(true);
        // Demo campaigns
        setCampaigns([
            {
                id: '1', name: 'Tech Founders Q1 Outreach', platform: 'linkedin',
                action_type: 'connect', status: 'active', daily_limit: 30,
                target_audience_url: 'https://linkedin.com/sales/search', personalization_template: 'Hi {name}, I noticed you\'re at {company}...',
                account_username: 'john.doe@email.com', total_leads: 847, connected_count: 312, replied_count: 89,
                created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: '2', name: 'SaaS Decision Makers', platform: 'linkedin',
                action_type: 'message', status: 'active', daily_limit: 25,
                target_audience_url: null, personalization_template: null,
                account_username: 'john.doe@email.com', total_leads: 523, connected_count: 201, replied_count: 67,
                created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: '3', name: 'Instagram Growth Campaign', platform: 'instagram',
                action_type: 'follow', status: 'paused', daily_limit: 50,
                target_audience_url: null, personalization_template: null,
                account_username: '@leadenforce_official', total_leads: 156, connected_count: 42, replied_count: 12,
                created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            },
        ]);
    }, []);

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'paused' : 'active';
        setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
        setSuccessMsg(`Campaign ${newStatus === 'active' ? 'resumed' : 'paused'} successfully`);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const handleDelete = async (id: string) => {
        setCampaigns(prev => prev.filter(c => c.id !== id));
        setSuccessMsg('Campaign deleted successfully');
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const newCampaign: Campaign = {
                id: Date.now().toString(),
                name: formData.name,
                platform: formData.platform,
                action_type: formData.actionType,
                status: 'active',
                daily_limit: parseInt(formData.dailyLimit) || 30,
                target_audience_url: formData.targetAudienceUrl || null,
                personalization_template: formData.personalizationTemplate || null,
                account_username: 'john.doe@email.com',
                total_leads: 0,
                connected_count: 0,
                replied_count: 0,
                created_at: new Date().toISOString(),
            };

            setCampaigns(prev => [newCampaign, ...prev]);
            setShowCreateModal(false);
            setFormData({ name: '', platform: 'linkedin', actionType: 'connect', dailyLimit: '30', targetAudienceUrl: '', personalizationTemplate: '', socialAccountId: '' });
            setSuccessMsg('Campaign created and started!');
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch {
            // handle error
        } finally {
            setIsLoading(false);
        }
    };

    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const totalLeads = campaigns.reduce((sum, c) => sum + c.total_leads, 0);

    return (
        <div className={`max-w-7xl transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* Success Toast */}
            {successMsg && (
                <div className="fixed top-20 right-8 z-50 animate-fade-in">
                    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-3 rounded-xl shadow-lg shadow-emerald-100">
                        <CheckCircle2 size={16} />
                        <span className="text-xs font-semibold">{successMsg}</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Campaigns</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        {activeCampaigns} active campaigns · {totalLeads.toLocaleString()} total leads
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-violet-200 transition-all duration-200 cursor-pointer"
                >
                    <Plus size={14} />
                    New Campaign
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'Active', value: activeCampaigns, icon: Zap, color: 'text-emerald-500' },
                    { label: 'Total Leads', value: totalLeads.toLocaleString(), icon: Users, color: 'text-blue-500' },
                    { label: 'Campaigns', value: campaigns.length, icon: Target, color: 'text-violet-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                        <stat.icon size={18} className={stat.color} />
                        <div>
                            <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Campaign Cards */}
            {campaigns.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-violet-50 rounded-2xl flex items-center justify-center">
                        <Target size={24} className="text-violet-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">No campaigns yet</p>
                    <p className="text-xs text-gray-400 mb-4">Create your first automation campaign to get started</p>
                    <button onClick={() => setShowCreateModal(true)} className="text-xs font-bold text-violet-600 hover:text-violet-800 cursor-pointer">
                        + Create Campaign
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {campaigns.map((campaign) => {
                        const PlatformIcon = platformIcons[campaign.platform] || Linkedin;
                        const gradient = platformGradients[campaign.platform] || platformGradients.linkedin;
                        const actionInfo = actionTypeLabels[campaign.action_type] || actionTypeLabels.connect;
                        const status = statusBadge[campaign.status] || statusBadge.active;
                        const ActionIcon = actionInfo.icon;
                        const acceptRate = campaign.total_leads > 0 ? ((campaign.connected_count / campaign.total_leads) * 100).toFixed(1) : '0';

                        return (
                            <div key={campaign.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all duration-300 group">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm flex-shrink-0`}>
                                            <PlatformIcon size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-sm font-bold text-gray-900">{campaign.name}</h3>
                                                <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${status.color}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                                    {status.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-[11px] text-gray-400">
                                                <span className="flex items-center gap-1"><ActionIcon size={11} />{actionInfo.label}</span>
                                                <span>@{campaign.account_username}</span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={11} />
                                                    {new Date(campaign.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleToggleStatus(campaign.id, campaign.status)}
                                            className={`p-2 rounded-lg transition-all cursor-pointer ${campaign.status === 'active' ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                                            title={campaign.status === 'active' ? 'Pause' : 'Resume'}
                                        >
                                            {campaign.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(campaign.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="mt-5 grid grid-cols-4 gap-4">
                                    {[
                                        { label: 'Total Leads', value: campaign.total_leads },
                                        { label: 'Connected', value: campaign.connected_count },
                                        { label: 'Replied', value: campaign.replied_count },
                                        { label: 'Accept Rate', value: `${acceptRate}%` },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-gray-50 rounded-xl p-3">
                                            <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-4">
                                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                        <span>Daily Limit: {campaign.daily_limit}</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700`}
                                            style={{ width: `${Math.min(100, (campaign.connected_count / Math.max(1, campaign.total_leads)) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Campaign Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
                            <h3 className="text-sm font-bold uppercase tracking-widest">New Campaign</h3>
                            <button onClick={() => setShowCreateModal(false)} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-6 space-y-5">
                            {/* Campaign Name */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">Campaign Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Tech Founders Q1 Outreach"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                    required
                                />
                            </div>

                            {/* Platform */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">Platform</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['linkedin', 'instagram', 'facebook'].map((p) => {
                                        const Icon = platformIcons[p];
                                        const grad = platformGradients[p];
                                        return (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, platform: p })}
                                                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer border-2
                                                    ${formData.platform === p
                                                        ? `bg-gradient-to-r ${grad} text-white border-transparent shadow-lg`
                                                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                                    }`}
                                            >
                                                <Icon size={14} />
                                                {p}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Action Type */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">Action Type</label>
                                <select
                                    value={formData.actionType}
                                    onChange={e => setFormData({ ...formData, actionType: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white appearance-none cursor-pointer"
                                >
                                    {Object.entries(actionTypeLabels).map(([key, val]) => (
                                        <option key={key} value={key}>{val.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Daily Limit */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">Daily Limit</label>
                                <input
                                    type="number"
                                    value={formData.dailyLimit}
                                    onChange={e => setFormData({ ...formData, dailyLimit: e.target.value })}
                                    min="1"
                                    max="200"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                />
                                <p className="text-[10px] text-gray-400 mt-1">Recommended: 20-50 per day during warmup</p>
                            </div>

                            {/* Target URL */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">Target Audience URL (Optional)</label>
                                <input
                                    type="url"
                                    value={formData.targetAudienceUrl}
                                    onChange={e => setFormData({ ...formData, targetAudienceUrl: e.target.value })}
                                    placeholder="LinkedIn Sales Navigator search URL"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                />
                            </div>

                            {/* Message Template */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">Message Template (Optional)</label>
                                <textarea
                                    value={formData.personalizationTemplate}
                                    onChange={e => setFormData({ ...formData, personalizationTemplate: e.target.value })}
                                    placeholder="Hi {name}, I noticed you're at {company}..."
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all resize-none"
                                />
                                <p className="text-[10px] text-gray-400 mt-1">Variables: {'{name}'}, {'{company}'}, {'{title}'}</p>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading || !formData.name}
                                className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-violet-200 transition-all duration-200 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Zap size={14} />
                                        Launch Campaign
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
