import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const CATEGORY_ITEMS = [
  { name: 'Food & Groceries', path: '/products?category=Food%20%26%20Groceries' },
  { name: 'Clothing', path: '/products?category=Clothing' },
  { name: 'Home Decor', path: '/products?category=Home%20Decor' },
  { name: 'Footwear', path: '/products?category=Footwear' },
  { name: 'Handicrafts', path: '/products?category=Handicrafts' },
];

export const Footer: React.FC = () => {
  const { showNotification } = useAppStore();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      showNotification('Thank you for subscribing to MiniStore exclusive deals!');
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#000000] text-stone-300 border-t border-stone-800 mt-20">
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Column 1: Brand & Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <span className="text-3xl font-black tracking-tighter text-white">
                Mini<span className="text-[#F45CAB]">Store</span>
              </span>
            </Link>

            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              MiniStore is Pakistan's premier modern storefront connecting generational master artisans, organic mountain harvests, and authentic handicrafts directly with homes across the country.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2 max-w-md pt-1">
              <span className="text-xs font-bold text-white block">Get exclusive deals in your inbox:</span>
              <div className="flex items-center rounded-full bg-stone-900 border border-stone-700 p-1 focus-within:border-[#F45CAB]">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full bg-transparent text-xs text-white placeholder:text-stone-500 px-3 py-1.5 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full text-white font-bold text-xs shrink-0 cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 bg-[#F45CAB] hover:bg-white hover:text-stone-900 hover:shadow-[#F45CAB]/30"
                >
                  Subscribe
                </button>
              </div>
            </form>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#facebook"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-stone-900 hover:bg-[#F45CAB] flex items-center justify-center text-white shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#instagram"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-stone-900 hover:bg-[#F45CAB] flex items-center justify-center text-white shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="#twitter"
                aria-label="Twitter or X"
                className="w-8 h-8 rounded-full bg-stone-900 hover:bg-[#F45CAB] flex items-center justify-center text-white font-bold text-xs shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
              >
                𝕏
              </a>
              <a
                href="#telegram"
                aria-label="Telegram"
                className="w-8 h-8 rounded-full bg-stone-900 hover:bg-[#F45CAB] flex items-center justify-center text-white shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
              >
                <Send className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Column 2: Shop MiniStore */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Shop MiniStore
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link to="/products" className="hover:text-white transition-colors cursor-pointer">All Collections</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors cursor-pointer">Featured Arrivals</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors cursor-pointer">Limited Time Deals</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors cursor-pointer">Shopping Cart</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors cursor-pointer">Order History</Link></li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Categories
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              {CATEGORY_ITEMS.map((cat) => (
                <li key={cat.name}>
                  <Link
                    to={cat.path}
                    className="hover:text-white transition-colors cursor-pointer text-left block"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Customer Support & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Customer Support & Policies
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link to="/orders" className="hover:text-white transition-colors cursor-pointer">Track My Order</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors cursor-pointer">Cash on Delivery (COD) FAQ</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors cursor-pointer">Return & Exchange Policy</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors cursor-pointer">Shipping & Dispatch Rules</Link></li>
              <li><Link to="/admin/products" className="hover:text-white transition-colors cursor-pointer">Artisan Partner Portal</Link></li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Sub-footer Bar */}
      <div className="border-t border-stone-900 bg-black/40 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-2">
          <p>© 2026 MiniStore Pakistan. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-stone-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-stone-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-stone-300 cursor-pointer">Shipping Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
