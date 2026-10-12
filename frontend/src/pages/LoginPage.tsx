import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { LogIn, AlertCircle, RefreshCw, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const redirectParam = searchParams.get('redirect');
  const from = redirectParam || (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch {
      // Error handled in store
    }
  };
  {/*
  const handleFillAdminCredentials = () => {
    clearError();
    setEmail('admin@example.com');
    setPassword('admin12345');
  };*/}

  return (
    <div className="max-w-md mx-auto py-8 px-4 sm:px-0">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E9DCE4] shadow-xs">
        <div className="text-center space-y-2 pb-6 border-b border-stone-100">
          <div className="inline-flex p-3 bg-[#FFF0F7] text-[#E13288] rounded-2xl">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Sign in to your account</h1>
          <p className="text-xs text-stone-500">
            Enter your credentials to browse, track orders, or manage products.
          </p>
        </div>

        {/* Development Admin Credentials helper 
        <div className="my-5 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 font-semibold text-stone-700">
              <KeyRound className="w-3.5 h-3.5 text-stone-500" />
              <span>Admin Demo:</span>
            </div>
            <button
              type="button"
              onClick={handleFillAdminCredentials}
              className="px-2.5 py-1 text-xs font-semibold bg-white border border-stone-200 rounded-lg hover:border-amber-400 hover:bg-amber-50 text-amber-800 transition cursor-pointer"
            >
              Fill admin credentials
            </button>
          </div>
        </div>*/}

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F45CAB] focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-full text-sm font-bold bg-[#03081E] hover:bg-[#F45CAB] text-white disabled:opacity-50 transition shadow-xs cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-stone-100 text-center text-xs text-stone-500">
          <span>Don't have an account yet? </span>
          <Link
            to={redirectParam ? `/signup?redirect=${encodeURIComponent(redirectParam)}` : '/signup'}
            className="font-bold text-[#E13288] hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};
