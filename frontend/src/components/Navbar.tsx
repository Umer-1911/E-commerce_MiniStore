import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  ShoppingCart,
  Search,
  MapPin,
  LogIn,
  UserPlus,
  LogOut,
  Shield,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const navigate = useNavigate();
  const cartCount = getTotalItems();

  const [headerSearch, setHeaderSearch] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(headerSearch.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-xs">
      {/* 1. Top Notice Bar — Match reference emerald dark green bar */}
      <div className="bg-[#0b3b2c] text-white py-1.5 px-4 text-center text-xs font-medium tracking-wide">
        <span>Welcome offer — </span>
        <span className="text-amber-300 font-bold underline decoration-amber-300/60">
          20% off
        </span>
        <span> your first order with code </span>
        <span className="font-mono bg-white/15 px-1.5 py-0.5 rounded text-amber-200 font-bold text-[11px]">
          MINIFRESH20
        </span>
      </div>

      {/* 2. Main Brand & Search Bar */}
      <div className="border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between gap-4 sm:gap-6">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black text-[#0b3b2c] tracking-tight">
                  Mini<span className="text-emerald-600">Store</span>
                </span>
                <span className="block text-[10px] font-semibold text-amber-600 uppercase tracking-widest leading-none -mt-0.5">
                  Fresh & Quality
                </span>
              </div>
            </Link>

            {/* Central Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex-1 max-w-xl mx-2 sm:mx-6 hidden md:block"
            >
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  placeholder="Search fresh groceries & authentic Pakistani products..."
                  className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-200/90 rounded-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full text-xs font-bold bg-[#0b3b2c] text-white hover:bg-emerald-700 transition"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Right Controls: Delivery, Cart, User */}
            <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
              {/* Delivery location info */}
              <div className="hidden lg:flex items-center gap-2 text-left pl-2 pr-1 border-r border-slate-200">
                <div className="p-2 rounded-full bg-emerald-50 text-emerald-700">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="leading-tight">
                  <span className="text-[10px] text-slate-400 block font-medium">Deliver to</span>
                  <span className="text-xs font-bold text-slate-800">Pakistan Wide</span>
                </div>
              </div>

              {/* Cart Button with Count Badge */}
              <Link
                to="/cart"
                className="relative flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/70 hover:border-emerald-200 transition group"
                title="View Shopping Cart"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-slate-700 group-hover:text-emerald-700 transition" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-extrabold px-1 leading-none shadow-xs animate-scale-in">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline text-xs font-bold text-slate-700 group-hover:text-emerald-800">
                  Cart
                </span>
              </Link>

              {/* User Authentication state */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {user?.name}
                    </span>
                    {user?.role === 'admin' ? (
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                        Administrator
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Customer</span>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-100"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-slate-50 transition"
                  >
                    <span className="flex items-center gap-1">
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign In</span>
                    </span>
                  </Link>
                  <Link
                    to="/signup"
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#0b3b2c] text-white hover:bg-emerald-700 transition shadow-xs flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile search bar */}
          <form onSubmit={handleSearchSubmit} className="mt-3 md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-20 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 rounded-md text-[11px] font-bold bg-[#0b3b2c] text-white"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 3. Secondary Navigation Bar — Fresh Grocery Links */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-11 text-xs">
            <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 no-scrollbar">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-3 py-1 rounded-full font-bold transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-slate-600 hover:text-emerald-700'
                  }`
                }
              >
                Home
              </NavLink>

              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `px-3 py-1 rounded-full font-semibold transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-slate-600 hover:text-emerald-700'
                  }`
                }
              >
                All Products
              </NavLink>

              <NavLink
                to="/products?category=Food%20%26%20Groceries"
                className="px-2.5 py-1 rounded-full font-medium text-slate-600 hover:text-emerald-700 whitespace-nowrap"
              >
                Groceries & Food
              </NavLink>

              <NavLink
                to="/products?category=Clothing"
                className="px-2.5 py-1 rounded-full font-medium text-slate-600 hover:text-emerald-700 whitespace-nowrap"
              >
                Clothing & Shawls
              </NavLink>

              <NavLink
                to="/products?category=Home%20Decor"
                className="px-2.5 py-1 rounded-full font-medium text-slate-600 hover:text-emerald-700 whitespace-nowrap"
              >
                Home & Craft
              </NavLink>

              {user?.role === 'customer' && (
                <NavLink
                  to="/orders"
                  className={({ isActive }) =>
                    `px-3 py-1 rounded-full font-bold transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'text-slate-600 hover:text-emerald-700'
                    }`
                  }
                >
                  My Orders
                </NavLink>
              )}

              {user?.role === 'admin' && (
                <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                  <NavLink
                    to="/admin/products"
                    className={({ isActive }) =>
                      `px-2.5 py-1 rounded-full font-bold transition-colors flex items-center gap-1 ${
                        isActive
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'text-amber-800 hover:bg-amber-50'
                      }`
                    }
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Products</span>
                  </NavLink>
                  <NavLink
                    to="/admin/orders"
                    className={({ isActive }) =>
                      `px-2.5 py-1 rounded-full font-bold transition-colors flex items-center gap-1 ${
                        isActive
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'text-amber-800 hover:bg-amber-50'
                      }`
                    }
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Orders</span>
                  </NavLink>
                </div>
              )}
            </nav>

            <div className="hidden md:flex items-center gap-4 text-slate-500 font-medium">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>100% Authentic Quality</span>
              </span>
              <span className="flex items-center gap-1 hover:text-slate-700 cursor-pointer">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Help & Support</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
