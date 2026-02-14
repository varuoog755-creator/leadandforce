'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, Zap, Globe, Cpu } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const response = await axios.post(`${API_URL}${endpoint}`, {
                email,
                password
            });

            if (typeof window !== 'undefined') {
                window.localStorage.setItem('token', response.data.token);
                window.localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            router.push('/dashboard');
        } catch (err: any) {
            const errorMessage = err.response?.data?.error?.message || err.message || 'Authorization Override Failed';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black selection:bg-blue-500/30">
            {/* Layers of Background */}
            <div className="mesh-bg" />
            <div className="grid-bg" />

            {/* Animated Floating Orbs */}
            <div className="orb w-[600px] h-[600px] bg-blue-600/20 top-[-20%] left-[-10%] animate-float-slow" />
            <div className="orb w-[500px] h-[500px] bg-purple-600/20 bottom-[-10%] right-[-10%] animate-float-slow" style={{ animationDelay: '-4s' }} />
            <div className="orb w-[300px] h-[300px] bg-pink-600/10 top-[40%] right-[10%] animate-float-slow" style={{ animationDelay: '-8s' }} />

            <div className="w-full max-w-2xl z-10 animate-premium">
                {/* Header Section */}
                <div className="text-center mb-16 px-4">
                    <div className="relative inline-flex mb-10">
                        <div className="absolute inset-0 bg-blue-500/30 blur-3xl rounded-full scale-150" />
                        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-[2px] shadow-[0_0_50px_rgba(37,99,235,0.5)]">
                            <div className="w-full h-full bg-black/20 rounded-[inherit] flex items-center justify-center backdrop-blur-xl">
                                <Zap className="w-12 h-12 text-white fill-current animate-pulse" />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-7xl font-[1000] tracking-tighter mb-6 leading-none">
                        <span className="bg-gradient-to-b from-white via-white to-gray-500 bg-clip-text text-transparent">
                            LEADENFORCE
                        </span>
                    </h1>

                    <div className="flex items-center justify-center gap-4 text-gray-500 font-bold tracking-[0.4em] uppercase text-[10px] opacity-80">
                        <span className="w-8 h-px bg-gray-800" />
                        <span className="flex items-center gap-2">
                            <Globe className="w-3 h-3 text-blue-500" />
                            Global Intelligence
                        </span>
                        <span className="w-8 h-px bg-gray-800" />
                    </div>
                </div>

                {/* Login Card */}
                <div className="glass-panel rounded-[3rem] p-1 shadow-2xl">
                    <div className="bg-black/40 rounded-[inherit] p-10 md:p-14 backdrop-blur-3xl relative">
                        {/* Interactive glow follows top edge */}
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

                        <form onSubmit={handleSubmit} className="space-y-10">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-4 animate-shake">
                                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="flex justify-between items-end px-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">System Identity</label>
                                    <span className="text-[8px] font-mono text-blue-500/50 italic">IPv6 Verified</span>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                                        <Mail className="w-5 h-5 text-gray-600 group-focus-within:text-blue-500 transition-colors duration-500" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="glass-input w-full pl-16 pr-8 py-6 rounded-2xl focus:outline-none placeholder:text-gray-800 font-medium text-lg bg-white/[0.02]"
                                        placeholder="operator@leadenforce.ai"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end px-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Neural Key</label>
                                    <span className="text-[8px] font-mono text-purple-500/50 italic">AES-256 Encrypted</span>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                                        <Lock className="w-5 h-5 text-gray-600 group-focus-within:text-purple-500 transition-colors duration-500" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="glass-input w-full pl-16 pr-8 py-6 rounded-2xl focus:outline-none placeholder:text-gray-800 font-medium text-lg bg-white/[0.02]"
                                        placeholder="••••••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-20 relative group overflow-hidden bg-white hover:bg-white/95 text-black rounded-2xl font-black text-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_20px_40px_-15px_rgba(255,255,255,0.2)]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-transparent to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-700" />
                                    <div className="absolute inset-0 shimmer-btn overflow-hidden opacity-50" />

                                    <span className="relative z-10 flex items-center justify-center gap-4">
                                        {loading ? (
                                            <Loader2 className="w-7 h-7 animate-spin" />
                                        ) : (
                                            <>
                                                {isLogin ? 'INITIATE PROTOCOL' : 'REGISTER AGENT'}
                                                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-500" />
                                            </>
                                        )}
                                    </span>
                                </button>
                            </div>
                        </form>

                        <div className="mt-12 flex flex-col items-center gap-8">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="px-8 py-4 rounded-xl border border-white/5 hover:border-white/20 transition-all text-[10px] font-black tracking-[0.3em] uppercase text-gray-500 hover:text-white"
                            >
                                {isLogin ? 'Request Operative Clearance' : 'Return to Authorization'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Badges */}
                <div className="mt-16 flex flex-wrap items-center justify-center gap-10 opacity-30">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-blue-500" />
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase">Secured by PulseVault</span>
                    </div>
                    <div className="w-px h-6 bg-gray-800 hidden sm:block" />
                    <div className="flex items-center gap-3">
                        <Cpu className="w-5 h-5 text-purple-500" />
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase">Edge Computing Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
