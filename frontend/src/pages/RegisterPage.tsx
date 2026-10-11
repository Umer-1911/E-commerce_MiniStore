import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { UserPlus, AlertCircle, RefreshCw, CheckSquare } from 'lucide-react';
import type { RegisterPayload } from '../types';

export const RegisterPage: React.FC = () => {
  const [name, setName]                           = useState('');
  const [email, setEmail]                         = useState('');
  const [password, setPassword]                   = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [marketingConsent, setMarketingConsent]   = useState(false);
  const [clientError, setClientError]             = useState<string | null>(null);

  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const redirectParam = searchParams.get('redirect');
  const from = redirectParam || (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setClientError(null);

    if (password !== passwordConfirmation) {
      setClientError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setClientError('Password must be at least 8 characters long.');
      return;
    }

    const payload: RegisterPayload & { marketing_consent?: boolean } = {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
      marketing_consent: marketingConsent,
    };

    try {
      await register(payload);
      navigate(from, { replace: true });
    } catch {
      // Error handled in store
    }
  };

  const displayError = clientError || error;

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        {/* Header */}
        <div className="text-center space-y-2 pb-6 border-b border-slate-100">
          <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-full">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="text-xs text-slate-500">
            Sign up to browse items and place orders.
          </p>
        </div>

        {/* Google Sign-In UI placeholder (OAuth not yet wired) */}
        <div className="mt-5">
          <button
            type="button"
            disabled
            title="Google Sign-In coming soon"
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-500 bg-slate-50 cursor-not-allowed opacity-60"
          >
            {/* Google "G" logo */}
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google (coming soon)
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs text-slate-400">
            <span className="bg-white px-2">or sign up with email</span>
          </div>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
            <span>{displayError}</span>
          </div>
        )}

        {/* Sign-Up Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tariq Mehmood"
              autoComplete="name"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="password">
              Password <span className="text-slate-400 font-normal">(min. 8 characters)</span>
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="password_confirmation">
              Confirm Password
            </label>
            <input
              id="password_confirmation"
              type="password"
              required
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* Marketing consent — optional, explicit opt-in */}
          <label className="flex items-start gap-2.5 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="sr-only peer"
                id="marketing_consent"
              />
              <div className="w-4 h-4 border-2 border-slate-300 rounded peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition flex items-center justify-center">
                {marketingConsent && <CheckSquare className="w-3 h-3 text-white" />}
              </div>
            </div>
            <span className="text-xs text-slate-500 leading-relaxed">
              <span className="font-medium text-slate-700">Send me promotional updates</span>
              {' '}— deals, new arrivals, and offers. You can unsubscribe at any time.
              {' '}<span className="text-slate-400">(Optional — you will still receive order confirmation emails.)</span>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          <span>Already have an account? </span>
          <Link
            to={redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : '/login'}
            className="font-semibold text-indigo-600 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
