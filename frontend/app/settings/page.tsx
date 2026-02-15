'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Settings, Plus, Trash2, Shield, Wifi, WifiOff, AlertTriangle,
    Eye, EyeOff, Linkedin, Instagram, Facebook, X, Loader2, CheckCircle2,
    BarChart3, Activity, Clock, Link as LinkIcon
} from 'lucide-react';
import { fetchSocialAccounts, addSocialAccount, deleteSocialAccount, fetchAccountStats, initLinkedInOAuth } from '../../lib/api';

interface SocialAccount {
    id: string;
    platform: string;
    username: string;
    status: string;
    proxy_ip: string | null;
    last_action_at: string | null;
    daily_action_count: number;
    warmup_day: number;
    created_at: string;
    auth_method?: string; // Added for OAuth support
}

interface AccountStats {
    total_actions: string;
    successful: string;
    failed: string;
    last_24h: string;
    avg_execution_time: number | null;
    campaign_count: number;
}

const platformConfig: Record<string, { icon: any; color: string; gradient: string; bg: string }> = {
    linkedin: { icon: Linkedin, color: 'text-blue-600', gradient: 'from-blue-500 to-blue-700', bg: 'bg-blue-50' },
    instagram: { icon: Instagram, color: 'text-pink-600', gradient: 'from-pink-500 to-rose-600', bg: 'bg-pink-50' },
    facebook: { icon: Facebook, color: 'text-blue-500', gradient: 'from-blue-400 to-indigo-600', bg: 'bg-indigo-50' },
};

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
    active: { label: 'Active', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-400' },
    warming_up: { label: 'Warming Up', color: 'text-amber-700 bg-amber-50 border-amber-200', dot: 'bg-amber-400' },
    paused: { label: 'Paused', color: 'text-gray-600 bg-gray-50 border-gray-200', dot: 'bg-gray-400' },
    banned: { label: 'Banned', color: 'text-red-700 bg-red-50 border-red-200', dot: 'bg-red-400' },
    error: { label: 'Error', color: 'text-red-700 bg-red-50 border-red-200', dot: 'bg-red-400' },
};

const DEMO_ACCOUNTS: SocialAccount[] = [
    {
        id: '1', platform: 'linkedin', username: 'john.doe@email.com', status: 'active',
        proxy_ip: '192.168.1.100', last_action_at: new Date().toISOString(),
        daily_action_count: 42, warmup_day: 14,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        auth_method: 'password'
    },
    {
        id: '2', platform: 'instagram', username: '@leadenforce_official', status: 'warming_up',
        proxy_ip: '10.0.0.55', last_action_at: new Date().toISOString(),
        daily_action_count: 8, warmup_day: 3,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        auth_method: 'password'
    },
];

export default function SettingsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [accounts, setAccounts] = useState<SocialAccount[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [isLive, setIsLive] = useState(false);
    const [formData, setFormData] = useState({
        platform: 'linkedin',
        username: '',
        password: '',
        proxyIp: '',
        proxyPort: '',
    });
    const [formError, setFormError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [oauthLoading, setOauthLoading] = useState(false);

    // Stats Modal
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [statsLoading, setStatsLoading] = useState(false);
    const [selectedAccountStats, setSelectedAccountStats] = useState<AccountStats | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<SocialAccount | null>(null);

    useEffect(() => {
        setMounted(true);
        loadAccounts();

        // Handle OAuth Callback Params
        const status = searchParams.get('status');
        const error = searchParams.get('error');

        if (status === 'success') {
            setSuccessMsg('LinkedIn account connected successfully!');
            router.replace('/settings'); // Clear params
            setTimeout(() => setSuccessMsg(''), 5000);
        } else if (error) {
            setFormError(error === 'oauth_failed' ? 'Failed to connect LinkedIn account.' : error);
            router.replace('/settings');
        }
    }, [searchParams]);

    const loadAccounts = async () => {
        try {
            const res = await fetchSocialAccounts();
            if (res.data) {
                setAccounts(Array.isArray(res.data) ? res.data : res.data.accounts || []);
                setIsLive(true);
                setPageLoading(false);
                return;
            }
        } catch (err) {
            console.log('API unavailable, using demo data');
        }
        setAccounts(DEMO_ACCOUNTS);
        setPageLoading(false);
    };

    const handleViewStats = async (account: SocialAccount) => {
        setSelectedAccount(account);
        setShowStatsModal(true);
        setStatsLoading(true);
        try {
            if (isLive) {
                const res = await fetchAccountStats(account.id);
                setSelectedAccountStats(res.data.stats);
            } else {
                // Demo stats
                await new Promise(resolve => setTimeout(resolve, 800));
                setSelectedAccountStats({
                    total_actions: '1,245',
                    successful: '1,180',
                    failed: '65',
                    last_24h: '42',
                    avg_execution_time: 1250,
                    campaign_count: 2
                });
            }
        } catch (err) {
            console.error('Failed to load stats');
        } finally {
            setStatsLoading(false);
        }
    };

    const handleLinkedInConnect = async () => {
        setOauthLoading(true);
        try {
            const res = await initLinkedInOAuth();
            if (res.data && res.data.url) {
                window.location.href = res.data.url;
            } else {
                setFormError('Failed to initiate LinkedIn connection.');
                setOauthLoading(false);
            }
        } catch (err) {
            console.error('OAuth Init Error:', err);
            setFormError('Failed to connect to server.');
            setOauthLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setIsLoading(true);

        if (!formData.username || !formData.password) {
            setFormError('Username and password are required');
            setIsLoading(false);
            return;
        }

        try {
            if (isLive) {
                const res = await addSocialAccount({
                    platform: formData.platform,
                    username: formData.username,
                    password: formData.password,
                    proxyIp: formData.proxyIp || undefined,
                    proxyPort: formData.proxyPort ? parseInt(formData.proxyPort) : undefined,
                });
                setAccounts(prev => [res.data, ...prev]);
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000));
                const newAccount: SocialAccount = {
                    id: Date.now().toString(), platform: formData.platform,
                    username: formData.username, status: 'warming_up',
                    proxy_ip: formData.proxyIp || null, last_action_at: null,
                    daily_action_count: 0, warmup_day: 1, created_at: new Date().toISOString(),
                    auth_method: 'password'
                };
                setAccounts(prev => [newAccount, ...prev]);
            }
            setShowAddModal(false);
            setFormData({ platform: 'linkedin', username: '', password: '', proxyIp: '', proxyPort: '' });
            setSuccessMsg('Account added successfully! Warmup process has started.');
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err: any) {
            setFormError(err.response?.data?.error || 'Failed to add account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setDeleteLoading(id);
        try {
            if (isLive) {
                await deleteSocialAccount(id);
            } else {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            setAccounts(prev => prev.filter(a => a.id !== id));
            setSuccessMsg('Account removed successfully.');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch {
            setFormError('Failed to delete account.');
        } finally {
            setDeleteLoading(null);
        }
    };

    return (
        <div className={`max-w-5xl transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* Success Toast */}
            {successMsg && (
                <div className="fixed top-20 right-8 z-50 animate-fade-in">
                    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-3 rounded-xl shadow-lg shadow-emerald-100">
                        <CheckCircle2 size={16} />
                        <span className="text-xs font-semibold">{successMsg}</span>
                    </div>
                </div>
            )}

            {/* Error Toast */}
            {formError && !showAddModal && (
                <div className="fixed top-20 right-8 z-50 animate-fade-in">
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl shadow-lg shadow-red-100">
                        <AlertTriangle size={16} />
                        <span className="text-xs font-semibold">{formError}</span>
                        <button onClick={() => setFormError('')} className="ml-2 hover:text-red-900"><X size={14} /></button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
                    <p className="text-sm text-gray-400 mt-1">Manage your social accounts and automation preferences</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleLinkedInConnect}
                        disabled={oauthLoading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#0077b5] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all duration-200 cursor-pointer disabled:opacity-70"
                    >
                        {oauthLoading ? <Loader2 size={14} className="animate-spin" /> : <Linkedin size={14} />}
                        Connect LinkedIn
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                    >
                        <Plus size={14} />
                        Manual Add
                    </button>
                </div>
            </div>

            {/* Connected Accounts */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                    <Shield size={16} className="text-violet-500" />
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800">Connected Accounts</h2>
                    <span className="ml-auto text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{accounts.length} accounts</span>
                </div>

                {accounts.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-2xl flex items-center justify-center">
                            <WifiOff size={24} className="text-gray-300" />
                        </div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">No accounts connected</p>
                        <p className="text-xs text-gray-400">Add your first social account to start automating</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {accounts.map((account) => {
                            const platform = platformConfig[account.platform] || platformConfig.linkedin;
                            const status = statusConfig[account.status] || statusConfig.active;
                            const PlatformIcon = platform.icon;
                            const isOAuth = account.auth_method === 'oauth';

                            return (
                                <div key={account.id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${platform.gradient} flex items-center justify-center shadow-sm relative`}>
                                            <PlatformIcon size={18} className="text-white" />
                                            {isOAuth && (
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm" title="Connected via OAuth">
                                                    <LinkIcon size={10} className="text-emerald-500" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-gray-800">{account.username}</p>
                                                <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${status.color}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                                    {status.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-[11px] text-gray-400 capitalize">{account.platform}</span>
                                                {account.proxy_ip && (
                                                    <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                                        <Wifi size={10} />
                                                        {account.proxy_ip}
                                                    </span>
                                                )}
                                                <span className="text-[11px] text-gray-400">Day {account.warmup_day}/14</span>
                                                <span className="text-[11px] text-gray-400">{account.daily_action_count} actions today</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleViewStats(account)}
                                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                                        >
                                            <BarChart3 size={14} />
                                            Stats
                                        </button>
                                        <button
                                            onClick={() => handleDelete(account.id)}
                                            disabled={deleteLoading === account.id}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer disabled:opacity-50 opacity-0 group-hover:opacity-100"
                                        >
                                            {deleteLoading === account.id ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={16} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Safety Warning */}
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
                <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-xs font-bold text-amber-800 mb-1">Anti-Ban Protection Active</p>
                    <p className="text-[11px] text-amber-600 leading-relaxed">
                        All accounts go through a 14-day warmup period. During warmup, daily action limits are gradually increased
                        to mimic natural human behavior. Never exceed recommended limits.
                    </p>
                </div>
            </div>

            {/* Add Account Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
                    <div
                        className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl animate-fade-in"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-sm font-bold uppercase tracking-widest">Add Social Account</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {formError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">{formError}</div>
                            )}

                            {/* Platform Select */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">Platform</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['linkedin', 'instagram', 'facebook'].map((p) => {
                                        const cfg = platformConfig[p];
                                        const Icon = cfg.icon;
                                        return (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, platform: p })}
                                                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer border-2
                                                    ${formData.platform === p
                                                        ? `bg-gradient-to-r ${cfg.gradient} text-white border-transparent shadow-lg`
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

                            {/* Username */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">Username / Email</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    placeholder="Enter your account email or username"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Enter your account password"
                                        className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                    <Shield size={10} />
                                    Encrypted with AES-256 before storage
                                </p>
                            </div>

                            {/* Proxy (Optional) */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">Proxy (Optional)</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <input
                                        type="text"
                                        value={formData.proxyIp}
                                        onChange={e => setFormData({ ...formData, proxyIp: e.target.value })}
                                        placeholder="IP Address"
                                        className="col-span-2 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                    />
                                    <input
                                        type="text"
                                        value={formData.proxyPort}
                                        onChange={e => setFormData({ ...formData, proxyPort: e.target.value })}
                                        placeholder="Port"
                                        className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-violet-200 transition-all duration-200 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        Adding Account...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={14} />
                                        Add Account
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Stats Modal */}
            {showStatsModal && selectedAccount && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowStatsModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${platformConfig[selectedAccount.platform].gradient} flex items-center justify-center`}>
                                    <BarChart3 size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">{selectedAccount.username}</h3>
                                    <p className="text-xs text-gray-400">Performance Stats</p>
                                </div>
                            </div>
                            <button onClick={() => setShowStatsModal(false)} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6">
                            {statsLoading ? (
                                <div className="py-12 flex flex-col items-center justify-center">
                                    <Loader2 size={32} className="animate-spin text-violet-500 mb-3" />
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Loading stats...</p>
                                </div>
                            ) : selectedAccountStats ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Actions</p>
                                            <p className="text-2xl font-bold text-gray-900">{selectedAccountStats.total_actions}</p>
                                        </div>
                                        <div className="p-4 bg-emerald-50 rounded-xl">
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Successful</p>
                                            <p className="text-2xl font-bold text-emerald-700">{selectedAccountStats.successful}</p>
                                        </div>
                                        <div className="p-4 bg-red-50 rounded-xl">
                                            <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Failed</p>
                                            <p className="text-2xl font-bold text-red-700">{selectedAccountStats.failed}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 border border-gray-100 rounded-xl flex items-center gap-3">
                                            <Clock size={20} className="text-blue-500" />
                                            <div>
                                                <p className="text-lg font-bold text-gray-900">{selectedAccountStats.last_24h}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions (Last 24h)</p>
                                            </div>
                                        </div>
                                        <div className="p-4 border border-gray-100 rounded-xl flex items-center gap-3">
                                            <Activity size={20} className="text-violet-500" />
                                            <div>
                                                <p className="text-lg font-bold text-gray-900">{Math.round(Number(selectedAccountStats.avg_execution_time || 0))} ms</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Avg. Response Time</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-violet-50 border border-violet-100 rounded-xl">
                                        <div className="flex items-start gap-3">
                                            <h4 className="text-sm font-bold text-violet-800">Campaign Activity</h4>
                                        </div>
                                        <p className="text-xs text-violet-600 mt-1">
                                            This account is currently active in <strong>{selectedAccountStats.campaign_count} campaigns</strong>.
                                            Keep an eye on daily limits to avoid temporary restrictions.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-gray-400 py-8">No stats available</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
