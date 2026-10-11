import React, { useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useAuthStore } from '../store/useAuthStore';
import { ShoppingBag, Truck, ShieldCheck, Clock, Phone, Heart } from 'lucide-react';

export const RootLayout: React.FC = () => {
  const { fetchCurrentUser, initialCheckDone } = useAuthStore();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  if (!initialCheckDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfbf9]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbf9] text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Polish Multi-Column Footer Matching Reference Grocery Design */}
      <footer className="bg-white border-t border-slate-200 mt-16 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-100">
            {/* 1. Brand column */}
            <div className="space-y-3">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-sm">
                  <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-xl font-black text-[#0b3b2c] tracking-tight">
                  Mini<span className="text-emerald-600">Store</span>
                </span>
              </Link>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your premier Pakistani destination for 100% authentic regional specialties,
                pure organic dry fruits, traditional handicrafts, and everyday essentials.
              </p>
              <div className="flex items-center gap-2 pt-1 text-xs text-slate-600 font-medium">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Customer Helpline: +92 (042) 111-MINI</span>
              </div>
            </div>

            {/* 2. Popular Categories */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Categories
              </h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>
                  <Link to="/products?category=Food%20%26%20Groceries" className="hover:text-emerald-700 transition">
                    Food & Groceries
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=Clothing" className="hover:text-emerald-700 transition">
                    Clothing & Traditional Kurtis
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=Home%20Decor" className="hover:text-emerald-700 transition">
                    Multani Blue Pottery & Decor
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=Footwear" className="hover:text-emerald-700 transition">
                    Handcrafted Peshawari Chappal
                  </Link>
                </li>
              </ul>
            </div>

            {/* 3. Customer Care & Guarantees */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Assurance & Delivery
              </h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Free Nationwide Delivery</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cash on Delivery (COD)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Fast 48-Hour Dispatch</span>
                </li>
                <li className="flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>100% Satisfaction Guarantee</span>
                </li>
              </ul>
            </div>

            {/* 4. Quick Links */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Quick Links
              </h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>
                  <Link to="/products" className="hover:text-emerald-700 transition">
                    All Products Catalog
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="hover:text-emerald-700 transition">
                    Shopping Cart
                  </Link>
                </li>
                <li>
                  <Link to="/orders" className="hover:text-emerald-700 transition">
                    Track Orders
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-emerald-700 transition">
                    Sign In / Register
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
            <p>© {new Date().getFullYear()} MiniStore Pakistan. All rights reserved.</p>
            <p className="flex items-center gap-2 font-medium text-slate-500">
              <span>Prices in PKR (Paisa accurate)</span>
              <span>•</span>
              <span>Laravel + Sanctum + PostgreSQL + React TS</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
