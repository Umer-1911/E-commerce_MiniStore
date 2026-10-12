import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Store } from 'lucide-react';


interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { pathname } = useLocation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#028643] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#028643] inline-block" />
            Admin Operations Console
          </p>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1 tracking-tight">
            Storefront Management
          </h1>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-2 flex-wrap">
          <Link
            to="/admin/dashboard"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              pathname.startsWith('/admin/dashboard')
                ? 'bg-[#0f382c] text-white shadow-sm'
                : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </Link>

          <Link
            to="/admin/products"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              pathname.startsWith('/admin/products')
                ? 'bg-[#0f382c] text-white shadow-sm'
                : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Products
          </Link>

          <Link
            to="/admin/orders"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              pathname.startsWith('/admin/orders')
                ? 'bg-[#0f382c] text-white shadow-sm'
                : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Orders
          </Link>

          <div className="h-5 w-px bg-stone-200 mx-1 hidden sm:block" />

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white text-stone-700 hover:bg-stone-50 border border-stone-200 transition-all duration-200"
          >
            <Store className="w-3.5 h-3.5 text-stone-500" />
            Customer Storefront
          </Link>
        </nav>
      </div>

      {/* ── Page Content ── */}
      {children}
    </div>
  );
};
