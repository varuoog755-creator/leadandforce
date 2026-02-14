'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [signing, setSigning] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.push('/dashboard');
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleGoogleLogin = async () => {
        setSigning(true);
        setError('');
        try {
            await signInWithPopup(auth, googleProvider);
            router.push('/dashboard');
        } catch (err: any) {
            console.error('Google Sign-In Error:', err);
            if (err.code === 'auth/popup-closed-by-user') {
                setError('Sign-in popup was closed');
            } else if (err.code === 'auth/unauthorized-domain') {
                setError('This domain is not authorized. Add it in Firebase Console.');
            } else {
                setError(err.message || 'Google sign-in failed');
            }
            setSigning(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-full max-w-sm px-8">
                {/* Logo / Brand */}
                <div className="text-center mb-10">
                    <div className="w-12 h-12 bg-black rounded-xl mx-auto mb-4 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-black tracking-tight">LeadEnforce</h1>
                    <p className="text-sm text-gray-400 mt-1">Social Automation Platform</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 text-center">
                        {error}
                    </div>
                )}

                {/* Google Sign In Button */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={signing}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-black hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {signing ? (
                        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    )}
                    {signing ? 'Signing in...' : 'Continue with Google'}
                </button>

                {/* Divider */}
                <div className="my-8 flex items-center">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="px-4 text-xs text-gray-400 uppercase tracking-wider">secure login</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>AES-256 Encrypted</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>Multi-Platform Automation</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>Real-time Analytics</span>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-300 mt-10">
                    By signing in, you agree to our Terms of Service
                </p>
            </div>
        </div>
    );
}
