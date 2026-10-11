import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ChevronRight,
  HeartHandshake,
} from 'lucide-react';
import { productService } from '../services/productService';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../types';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    async function loadCatalog() {
      try {
        const data = await productService.list({ per_page: 12, sort_by: 'created_at', sort_dir: 'desc' });
        setProducts(data.data);
      } catch (err) {
        console.error('Failed to load home products', err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const categories = [
    {
      name: 'Food & Groceries',
      subtitle: 'Pure & Organic',
      icon: '🌾',
      bg: 'from-emerald-50 to-teal-50',
      border: 'border-emerald-200',
    },
    {
      name: 'Clothing',
      subtitle: 'Lawn & Shawls',
      icon: '🧣',
      bg: 'from-amber-50 to-orange-50',
      border: 'border-amber-200',
    },
    {
      name: 'Home Decor',
      subtitle: 'Multani Pottery',
      icon: '🏺',
      bg: 'from-blue-50 to-indigo-50',
      border: 'border-blue-200',
    },
    {
      name: 'Footwear',
      subtitle: 'Peshawari Chappal',
      icon: '👞',
      bg: 'from-stone-50 to-amber-50',
      border: 'border-amber-200',
    },
    {
      name: 'Handicrafts',
      subtitle: 'Artisan Heritage',
      icon: '🪵',
      bg: 'from-rose-50 to-amber-50',
      border: 'border-rose-200',
    },
  ];

  // Deals: pick first 3 food or available products
  const dealProducts = products.slice(0, 3);

  // Filtered products for "Only the Best for You"
  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="space-y-12 pb-8">
      {/* ── 1. HERO BANNER — Match Reference Forest Green Hero with CTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="relative rounded-3xl bg-[#0b3b2c] text-white overflow-hidden shadow-xl p-8 sm:p-12 lg:p-16">
          {/* Subtle Organic Background Patterns */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 text-amber-300 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>100% PURE & AUTHENTIC PAKISTANI SPECIALTIES</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                FRESH & AUTHENTIC{' '}
                <span className="text-amber-300">GROCERIES,</span> DELIVERED TO YOUR DOOR
              </h1>

              <p className="text-emerald-100/90 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
                From farm-fresh basmati and Hunza dry fruits to handmade Peshawari footwear and artisan crafts.
                Shipped nationwide with guaranteed cash on delivery.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/products"
                  className="px-8 py-3.5 rounded-full bg-[#f3b738] hover:bg-[#e4a825] text-slate-900 font-extrabold text-sm transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <span>Shop now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center gap-3 text-xs text-emerald-200 font-medium">
                  <div className="flex -space-x-1.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 border border-white flex items-center justify-center text-[10px] font-bold">✓</span>
                    <span className="w-6 h-6 rounded-full bg-teal-700 border border-white flex items-center justify-center text-[10px] font-bold">★</span>
                    <span className="w-6 h-6 rounded-full bg-amber-600 border border-white flex items-center justify-center text-[10px] font-bold">COD</span>
                  </div>
                  <span>Free shipping on all regional orders</span>
                </div>
              </div>
            </div>

            {/* Right Fresh Harvest Illustration Box */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md aspect-4/3 sm:aspect-square rounded-2xl bg-gradient-to-tr from-emerald-900/60 to-emerald-800/40 border border-white/15 p-6 flex flex-col items-center justify-center text-center shadow-inner">
                {/* Visual produce composition */}
                <div className="text-6xl sm:text-7xl select-none mb-3 animate-bounce-gentle">
                  🧺
                </div>
                <div className="text-3xl select-none flex gap-2">
                  <span>🌾</span>
                  <span>🍯</span>
                  <span>🥜</span>
                  <span>🍵</span>
                </div>
                <div className="mt-4 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                  <span className="text-xs font-bold text-amber-300 block">Harvest of Pakistan</span>
                  <span className="text-[11px] text-emerald-100">Direct from Karak, Hunza & Multan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. CATEGORY CARDS — Horizontal Row Matching Reference ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className={`p-4 rounded-2xl bg-white border ${cat.border} hover:shadow-md transition-all duration-200 flex items-center justify-between group`}
            >
              <div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-emerald-700 transition">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">{cat.subtitle}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 3. EXCLUSIVE DEALS FOR YOU — Countdown Card + Deal Cards ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Exclusive Deals for You
            </h2>
            <p className="text-xs text-slate-500">Hand-selected best values available this week</p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Today's Special Offers Dark Green Countdown Card */}
          <div className="md:col-span-4 rounded-2xl bg-[#0b3b2c] text-white p-6 sm:p-7 flex flex-col justify-between shadow-md relative overflow-hidden">
            <div className="space-y-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900 uppercase">
                Limited Time
              </span>
              <h3 className="text-2xl font-black tracking-tight leading-snug">
                Today's Special Offers
              </h3>
              <p className="text-xs text-emerald-200">
                Special bundle savings on organic mountain harvests & certified staples.
              </p>
            </div>

            {/* Countdown timers */}
            <div className="my-6 grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-xs">
                <span className="block text-lg font-black text-amber-300">02</span>
                <span className="text-[10px] text-emerald-200 uppercase font-bold">Days</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-xs">
                <span className="block text-lg font-black text-amber-300">14</span>
                <span className="text-[10px] text-emerald-200 uppercase font-bold">Hours</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-xs">
                <span className="block text-lg font-black text-amber-300">45</span>
                <span className="text-[10px] text-emerald-200 uppercase font-bold">Mins</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/15">
              <span className="text-xs text-emerald-100 font-medium">Extra 20% applied at checkout</span>
              <span className="text-2xl select-none">🍯</span>
            </div>
          </div>

          {/* 3 Deal Product Cards */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {dealProducts.map((p) => (
              <ProductCard key={p.id} product={p} badge="20% OFF" isDeal />
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. "ONLY THE BEST FOR YOU" — Main Showcase Product Grid ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Only the Best for You
            </h2>
            <p className="text-xs text-slate-500">Premium Pakistani collections & daily essentials</p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
            {['All', 'Food & Groceries', 'Clothing', 'Home Decor', 'Footwear'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#0b3b2c] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 py-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-3">
                <div className="aspect-square bg-slate-100 rounded-xl" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-8 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <p className="text-slate-500 text-sm">No items found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredProducts.map((p, idx) => (
              <ProductCard
                key={p.id}
                product={p}
                badge={idx % 3 === 0 ? 'POPULAR' : undefined}
              />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-emerald-700 bg-white text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition shadow-xs"
          >
            <span>See All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ── 5. PROMOTIONAL DELIVERY BANNER — Matching Reference Mid-Page Banner ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-[#0b3b2c] text-white p-8 sm:p-12 overflow-hidden relative shadow-lg">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-900 inline-block uppercase">
              Nationwide Express
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Get 20% Off on Your First Delivery!
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Experience authentic Pakistani treasures delivered right to your doorstep.
              Hassle-free cash on delivery and easy 7-day returns.
            </p>
            <div className="pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#f3b738] hover:bg-[#e4a825] text-slate-900 font-extrabold text-xs transition shadow-md"
              >
                <span>Order now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Delivery Icon Graphic */}
          <div className="absolute right-4 sm:right-12 bottom-4 text-7xl sm:text-8xl select-none opacity-80 sm:opacity-100">
            🛵
          </div>
        </div>
      </section>

      {/* ── 6. TESTIMONIALS / "Trusted by Families Every Day" ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Trusted by Families Every Day
          </h2>
          <p className="text-xs text-slate-500">
            Real customer reviews across Lahore, Karachi, Islamabad, and beyond.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex text-amber-400 text-xs">
              {'★★★★★'}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "The Hunza dry fruits gift box arrived fresh and beautifully packaged. The chilgoza and walnuts are top tier. Delivery to Lahore was under 48 hours!"
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                F
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">Fatima Zahra</span>
                <span className="text-[10px] text-slate-400">Lahore</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex text-amber-400 text-xs">
              {'★★★★★'}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "Super Kernel Basmati rice has incredible aroma and long grain length after cooking. This is my 3rd order. Truly dependable quality."
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
                A
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">Ahmed Khalid</span>
                <span className="text-[10px] text-slate-400">Islamabad</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex text-amber-400 text-xs">
              {'★★★★★'}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "Ordered the Peshawari Chappal and Multani vase. Both are masterfully hand-crafted. Cash on delivery made the purchase completely risk-free."
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                M
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">Mohsin Ali</span>
                <span className="text-[10px] text-slate-400">Karachi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. TRUST & FRESHNESS FEATURE BANNER ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-amber-50/70 border border-amber-200/60 p-8 sm:p-10">
          <div className="max-w-2xl mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Freshness You Can Trust, Service You'll Love
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Every order is prepared with strict adherence to quality and customer satisfaction.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-white text-emerald-700 shadow-xs border border-amber-200/70 flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Farm-Fresh & Organic</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  We source directly from regional growers and traditional master artisans.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-white text-emerald-700 shadow-xs border border-amber-200/70 flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">100% Halal Certified</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Every food item is pure, unadulterated, and strictly halal compliant.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-white text-emerald-700 shadow-xs border border-amber-200/70 flex-shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Nationwide Free Shipping</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Prompt delivery with careful insulated packaging for fresh food items.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-white text-emerald-700 shadow-xs border border-amber-200/70 flex-shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Cash on Delivery</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Inspect your goods at your doorstep before paying the courier.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
