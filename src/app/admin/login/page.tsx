'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles, Store } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDemoMode] = useState<boolean>(() => !isSupabaseConfigured());

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          router.replace('/admin');
        }
      } catch (err) {
        console.error('Auth check error:', err);
      }
    };

    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    if (isDemoMode) {
      // Local preview mode without configured Supabase credentials
      localStorage.setItem('theichalle_admin_preview', 'true');
      router.push('/admin');
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message || 'Invalid credentials. Please verify your email and password.');
        setIsLoading(false);
        return;
      }

      if (data.user) {
        router.push('/admin');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during login.';
      setErrorMessage(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-center items-center p-4 selection:bg-[#5C1A26] selection:text-[#FAF6F0]">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex flex-col items-center group">
          <Image
            src="/logo.png"
            alt="The Ichalle - Timeless Women Wear"
            width={240}
            height={60}
            priority
            style={{ maxHeight: '60px', maxWidth: '240px', width: 'auto', height: 'auto' }}
            className="object-contain transition-opacity group-hover:opacity-90"
          />
        </Link>
        <div className="flex items-center justify-center gap-1.5 mt-3 text-xs uppercase tracking-widest text-[#C2654A] font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Management Portal</span>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-[#FAF6F0] rounded-sm p-8 sm:p-10 shadow-xl border border-[#EADFCF]">
        <h2 className="font-serif text-2xl text-[#2B2625] font-normal mb-2 text-center">
          Admin Sign In
        </h2>
        <p className="text-xs text-center text-[#2B2625]/60 mb-6">
          Access the catalog inventory & brand settings
        </p>

        {isDemoMode && (
          <div className="mb-6 p-3.5 bg-[#F3ECE1] border border-[#C2654A]/30 rounded text-xs text-[#2B2625]/85 space-y-1">
            <div className="font-semibold text-[#5C1A26] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-[#C2654A]" />
              <span>Preview Mode Active</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Supabase environment variables are currently using placeholder values. Click <strong>&quot;Enter Admin Portal&quot;</strong> below to explore the dashboard layout and features.
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#2B2625] font-semibold mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#2B2625]/40">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required={!isDemoMode}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@theichalle.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF6F0] border border-[#EADFCF] rounded text-sm text-[#2B2625] focus:outline-none focus:border-[#5C1A26] focus:ring-1 focus:ring-[#5C1A26] transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#2B2625] font-semibold mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#2B2625]/40">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required={!isDemoMode}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF6F0] border border-[#EADFCF] rounded text-sm text-[#2B2625] focus:outline-none focus:border-[#5C1A26] focus:ring-1 focus:ring-[#5C1A26] transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-[#5C1A26] hover:bg-[#46121C] text-[#FAF6F0] py-3 px-4 rounded text-xs uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 shadow-md transition-all duration-200 disabled:opacity-50"
          >
            <span>{isLoading ? 'Authenticating...' : isDemoMode ? 'Enter Admin Portal' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Back to storefront link */}
        <div className="mt-8 pt-6 border-t border-[#EADFCF] text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#2B2625]/60 hover:text-[#5C1A26] transition-colors"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Return to Public Boutique</span>
          </Link>
        </div>
      </div>
    </div>
  );
}