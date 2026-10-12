import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { UserPlus, AlertCircle, RefreshCw, CheckSquare } from 'lucide-react';
import type { RegisterPayload } from '../types';

export const RegisterPage: React.FC = () => {
  const [name, setName]                                   = useState('');
  const [email, setEmail]                                 = useState('');
  const [password, setPassword]                           = useState('');
  const [passwordConfirmation, setPasswordConfirmation]   = useState('');
  const [marketingConsent, setMarketingConsent]           = useState(false);
  const [clientError, setClientError]                     = useState<string | null>(null);

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
    <div className="max-w-md mx-auto py-8 px-4 sm:px-0">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E9DCE4] shadow-xs">
        {/* Header */}
        <div className="text-center space-y-2 pb-6 border-b border-stone-100">
          <div className="inline-flex p-3 bg-[#FFF0F7] text-[#E13288] rounded-2xl">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Create an account</h1>
          <p className="text-xs text-stone-500">
            Sign up to track orders, save shipping details, and access authentic items.
          </p>
        </div>

        {displayError && (
          <div className="my-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
            <span>{displayError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fatima Ali"
              autoComplete="name"
              className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F45CAB] focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1" htmlFor="email">
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
              className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F45CAB] focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1" htmlFor="password">
              Password <span className="text-stone-400 font-normal">(min. 8 characters)</span>
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F45CAB] focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1" htmlFor="password_confirmation">
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
              className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F45CAB] focus:border-transparent transition"
            />
          </div>

          {/* Marketing consent */}
          <label className="flex items-start gap-2.5 cursor-pointer group pt-1">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="sr-only peer"
                id="marketing_consent"
              />
              <div className="w-4 h-4 border-2 border-stone-300 rounded peer-checked:bg-[#E13288] peer-checked:border-[#E13288] transition flex items-center justify-center">
                {marketingConsent && <CheckSquare className="w-3 h-3 text-white" />}
              </div>
            </div>
            <span className="text-xs text-stone-600 leading-relaxed">
              <span className="font-semibold text-stone-800">Send me promotional updates</span>
              {' '}for new arrivals and store announcements. You can unsubscribe at any time.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-full text-sm font-bold bg-[#03081E] hover:bg-[#F45CAB] text-white disabled:opacity-50 transition shadow-xs cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-stone-100 text-center text-xs text-stone-500">
          <span>Already have an account? </span>
          <Link
            to={redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : '/login'}
            className="font-bold text-[#E13288] hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
