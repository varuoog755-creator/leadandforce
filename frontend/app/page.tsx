'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();

    useEffect(() => {
        // Auto-redirect to dashboard without login
        router.push('/dashboard');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
            <div className="text-center">
                <div className="w-6 h-6 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Loading Dashboard...</p>
            </div>
        </div>
    );
}
