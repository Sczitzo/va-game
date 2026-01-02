'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'FACILITATOR' | 'CLINICIAN'>('CLINICIAN');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      router.push('/login');
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
            <h1 className="jackbox-title jackbox-title-gradient text-3xl mb-2">✨ Create Account</h1>
            <p className="jackbox-subtitle jackbox-subtitle-dark">
              Register for a new account
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
                Password <span className="text-xs text-gray-600">(min. 8 characters)</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="jackbox-input-light"
                aria-required="true"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-semibold mb-2 text-gray-900">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'FACILITATOR' | 'CLINICIAN')}
                className="jackbox-input-light"
              >
                <option value="CLINICIAN">👨‍⚕️ Clinician</option>
                <option value="FACILITATOR">🎯 Facilitator</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="jackbox-button-primary w-full focus-visible-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '⏳ Creating account...' : '🚀 Create account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <Link href="/login" className="block text-sm font-semibold text-jackbox-purple hover:text-jackbox-blue transition-colors">
              🔐 Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

