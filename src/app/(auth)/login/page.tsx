'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      setUser(data.user);
      
      // Redirect based on role
      if (data.user.role === 'FACILITATOR') {
        router.push('/dashboard');
      } else {
        router.push('/care-teams');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 jackbox-gradient-bg">
      <div className="max-w-md w-full space-y-8">
        <div className="jackbox-card">
          <div className="text-center mb-6">
            <h1 className="jackbox-title jackbox-title-gradient text-3xl mb-2">🔐 Facilitator Login</h1>
            <p className="jackbox-subtitle jackbox-subtitle-dark">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-300 text-red-700 rounded-xl" role="alert">
                <span className="font-semibold">⚠️</span> {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2 text-gray-900">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="jackbox-input-light"
                aria-required="true"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2 text-gray-900">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="jackbox-input-light"
                aria-required="true"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="jackbox-button-primary w-full focus-visible-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '⏳ Signing in...' : '🚀 Sign in'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center space-y-3">
            <Link href="/register" className="block text-sm font-semibold text-jackbox-purple hover:text-jackbox-blue transition-colors">
              ✨ Don&apos;t have an account? Register here
            </Link>
            <Link href="/" className="block text-sm text-gray-600 hover:text-gray-800 transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

