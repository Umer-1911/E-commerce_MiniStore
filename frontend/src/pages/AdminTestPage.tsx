import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';
import { ShieldCheck, ShieldAlert, RefreshCw } from 'lucide-react';
import axios from 'axios';

export const AdminTestPage: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{ status: number; message: string } | null>(null);

  const runAdminTest = async () => {
    setLoading(true);
    setResult(null);
    try {
      const data = await authService.testAdminAccess();
      setResult({
        status: 200,
        message: data.message,
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setResult({
          status: err.response?.status || 500,
          message: err.response?.data?.message || 'Access Denied',
        });
      } else {
        setResult({
          status: 500,
          message: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAdminTest();
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Development & Test Endpoint
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Admin Authorization Test</h1>
            <p className="text-xs text-slate-500 mt-0.5">Endpoint: <code>GET /api/admin/test</code></p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Current Authenticated Session
            </h3>
            <div className="mt-2 flex items-center justify-between text-sm">
              <div>
                <span className="font-bold text-slate-900">{user?.name}</span>
                <span className="text-slate-500 text-xs ml-2">({user?.email})</span>
              </div>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                user?.role === 'admin'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
              }`}>
                Role: {user?.role}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={runAdminTest}
              disabled={loading}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Test Authorization Endpoint</span>
            </button>
          </div>

          {result && (
            <div className={`mt-4 p-4 rounded-xl border flex items-start space-x-3 ${
              result.status === 200
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              {result.status === 200 ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm">HTTP {result.status}</span>
                  <span className="text-xs font-medium">
                    {result.status === 200 ? 'Access Granted' : 'Access Rejected'}
                  </span>
                </div>
                <p className="text-xs mt-1 font-mono">{result.message}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
