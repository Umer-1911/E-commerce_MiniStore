import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { user, isAuthenticated, initialCheckDone } = useAuthStore();
  const location = useLocation();

  if (!initialCheckDone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm text-slate-500 font-medium">Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-2xl border border-rose-200 shadow-sm text-center">
        <div className="inline-flex p-3 bg-rose-50 text-rose-600 rounded-full mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-slate-600 text-sm mt-2">
          This area requires administrator privileges. Your current account has the{' '}
          <span className="font-semibold text-slate-800">{user.role}</span> role.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
