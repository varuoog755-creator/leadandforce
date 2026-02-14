'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Mail, Lock, Loader2, ArrowRight, Shield } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

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
            console.log(`[AUTH] Attempting ${endpoint} at ${API_URL}`);

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
            console.error('Auth Error Details:', err.response?.data || err.message);

            let errorMessage = 'Authentication failed';

            if (err.response) {
                // Check for validation errors array from backend
                const data = err.response.data;
                if (data.errors && Array.isArray(data.errors)) {
                    errorMessage = data.errors.map((e: any) => e.msg || e.message).join(', ');
                } else {
                    errorMessage = data.error?.message || data.message || `Error ${err.response.status}`;
                }
            } else if (err.request) {
                errorMessage = 'Server unreachable. Please check your connection.';
            } else {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-6 selection:bg-blue-100 dark:selection:bg-blue-900/30">
            <div className="w-full max-w-md animate-fade-in">
                {/* Minimal Header */}
                <div className="flex flex-col items-center mb-12">
                    <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center mb-6">
                        <Shield className="w-6 h-6 text-white dark:text-black" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight mb-2 uppercase">
                        LeadEnforce
                    </h1>
                    <p className="text-sm text-secondary font-medium tracking-wide uppercase">
                        {isLogin ? 'Authorization Required' : 'Request Access Clearance'}
                    </p>
                </div>

                {/* Form Wrapper */}
                <div className="min-panel p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-md text-xs font-semibold">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-secondary">Work Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-4 w-4 h-4 text-secondary" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="min-input w-full pl-12 text-sm"
                                    placeholder="name@company.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-secondary">Security Key</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-4 w-4 h-4 text-secondary" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="min-input w-full pl-12 text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="min-button w-full flex items-center justify-center gap-2 text-sm"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Login to Dashboard' : 'Create Agent Account'}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-border flex justify-center">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            className="text-[11px] font-bold uppercase tracking-widest text-secondary hover:text-foreground transition-colors"
                        >
                            {isLogin ? 'Need an account? Sign up' : 'Already have access? Log in'}
                        </button>
                    </div>
                </div>

                {/* Subtle Footer */}
                <div className="mt-12 text-center">
                    <p className="text-[10px] text-secondary/50 uppercase tracking-[0.2em] font-medium">
                        © 2026 LeadEnforce Automation • Secure Instance
                    </p>
                </div>
            </div>
        </div>
    );
}
