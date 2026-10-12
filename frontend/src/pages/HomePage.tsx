import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Users,
  Handshake,
  PhoneCall,
  ShoppingBag,
  Truck,
  ShieldCheck,
  PackageCheck,
  Award,
  RefreshCw,
  HeartHandshake,
  ChevronDown,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { productService } from '../services/productService';
import { ProductCard } from '../components/ProductCard';
import { CategoryCard } from '../components/CategoryCard';
import type { Product } from '../types';

const CATEGORIES_DATA = [
  {
    name: 'Food & Groceries',
    description: 'Pure honeys, mountain nuts, basmati rice and teas',
    count: 18,
    image: '/images/hunza_dry_fruits_1790952113079.jpg',
  },
  {
    name: 'Footwear',
    description: 'Handcrafted pure leather Peshawari chappals',
    count: 12,
    image: '/images/peshawari_chappal_1790952083619.jpg',
  },
  {
    name: 'Clothing',
    description: 'Hand block Ajrak, fine pashminas and lawn kurtis',
    count: 15,
    image: '/images/embroidered_kurti_1790952127717.jpg',
  },
  {
    name: 'Home Decor',
    description: 'Multani blue ceramics and camel skin table lamps',
    count: 9,
    image: '/images/multani_pottery_vase_1790952099954.jpg',
  },
  {
    name: 'Handicrafts',
    description: 'Chinioti brass rosewood and regional crafts',
    count: 14,
    image: '/images/hero_pakistani_crafts_1790952064704.jpg',
  },
];

const FAQ_ITEMS = [
  {
    q: 'How does MiniStore delivery work?',
    a: 'MiniStore connects authentic Pakistani regional craftsmen, organic farmers, and daily essentials with homes nationwide. Place an order online in seconds, track fulfillment, and pay safely upon delivery via Cash on Delivery (COD).',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We support verified Cash on Delivery (COD) across 180+ cities in Pakistan. Pay the exact order amount directly to the courier rider upon package inspection.',
  },
  {
    q: 'Can I track my order status?',
    a: 'Yes. Every order features live tracking with status progression: Pending, Processing, Shipped via TCS or Call Courier, and Completed upon doorstep handover.',
  },
  {
    q: 'Is Cash on Delivery available across Pakistan?',
    a: 'Yes. Cash on Delivery is active in Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Quetta, Multan, Faisalabad, Sialkot, and all major cities nationwide.',
  },
];

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dealCategoryFilter, setDealCategoryFilter] = useState('All');
  const [heroSearchInput, setHeroSearchInput] = useState('');
  const [activeFaqIndex, setActiveFaqIndex] = useState(0);
  const [activeFaqTab, setActiveFaqTab] = useState('Frequent Questions');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      try {
        const data = await productService.list({
          per_page: 12,
          sort_by: 'created_at',
          sort_dir: 'desc',
        });
        if (isMounted) {
          setProducts(data.data);
        }
      } catch (err) {
        console.error('Failed to load home catalog', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchInput.trim()) {
      navigate(`/products?search=${encodeURIComponent(heroSearchInput.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const exclusiveDeals = products.filter((p) => {
    if (dealCategoryFilter === 'All') return true;
    return p.category === dealCategoryFilter;
  });

  const displayedDeals = exclusiveDeals.slice(0, 3);
  const popularProducts = products.slice(0, 8);

  return (
    <div className="space-y-16 md:space-y-24 pb-16">
      
      {/* ── 1. HERO SECTION ── */}
      <section className="relative w-full border-b border-[#E9DCE4] overflow-hidden py-10 sm:py-14 lg:py-16 bg-[#FFF9FC]">
        {/* Ambient Supermarket Shopper Background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <img
            src="/images/hero_grocery_shopper_1791756749390.jpg"
            alt="MiniStore Shopper"
            className="w-full h-full object-cover object-right opacity-20 sm:opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFF9FC] via-[#FFF9FC]/85 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Copy & Search */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs sm:text-sm font-semibold text-stone-500 uppercase tracking-wider block">
                Order Pakistani crafts, authentic food and groceries.
              </span>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.1]">
                Feast Your Senses,<br />
                <span className="text-[#E13288]">Fast and Fresh</span>
              </h1>

              <p className="text-xs sm:text-sm text-stone-600 font-medium">
                Enter an item, city or area to explore our collection delivered across Pakistan:
              </p>

              {/* Search Bar Input & CTA */}
              <div className="space-y-3">
                <form
                  onSubmit={handleHeroSearch}
                  className="max-w-md flex items-center bg-white rounded-full border border-stone-300 p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-[#F45CAB]"
                >
                  <input
                    type="text"
                    value={heroSearchInput}
                    onChange={(e) => setHeroSearchInput(e.target.value)}
                    placeholder="e.g. Peshawari Chappal, Honey, Basmati..."
                    className="w-full text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 pl-4 pr-2 py-2 focus:outline-none bg-transparent"
                  />
                  <button
                    type="submit"
                    className="group h-10 sm:h-12 px-6 sm:px-8 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 cursor-pointer bg-[#F45CAB] hover:bg-[#03081E] text-white shadow-md hover:shadow-xl hover:shadow-[#F45CAB]/30 transition-all duration-300"
                  >
                    <span>Search</span>
                    <ChevronRight className="w-4 h-4 ml-1 stroke-[3] transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </form>

                {/* Primary CTA Buttons */}
                <div className="flex items-center gap-3 pt-1">
                  <Link
                    to="/products"
                    className="group px-6 py-3 rounded-full font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-[#F45CAB] hover:bg-[#03081E] text-white hover:shadow-[#F45CAB]/30"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/products"
                    className="px-6 py-3 rounded-full font-bold text-xs sm:text-sm bg-white hover:bg-[#03081E] text-stone-800 hover:text-white border border-stone-300 hover:border-[#03081E] shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    Explore
                  </Link>
                </div>
              </div>

              {/* Popular tags */}
              <div className="flex items-center gap-2 text-xs text-stone-500 flex-wrap">
                <span className="font-semibold">Popular:</span>
                {['Peshawari Chappal', 'Multani Ceramics', 'Hunza Dry Fruits', 'Basmati Rice'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => navigate(`/products?search=${encodeURIComponent(term)}`)}
                    className="hover:text-[#E13288] hover:border-[#F45CAB]/50 hover:bg-white text-stone-700 bg-white/70 px-2.5 py-1 rounded-full border border-stone-200 transition-all duration-200 cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Hero Image Composition with 3 Floating Notification Cards */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl overflow-hidden shadow-lg border border-stone-200 bg-white">
                <img
                  src="/images/hero_pakistani_crafts_1790952064704.jpg"
                  alt="Pakistani heritage craft banquet"
                  className="w-full h-80 object-cover"
                />
              </div>

              {/* Notification Overlay 1 */}
              <div className="hidden sm:flex items-center gap-3 absolute -top-4 -right-4 bg-white/95 backdrop-blur-md border border-stone-200 p-3 rounded-2xl shadow-xl max-w-xs animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0 bg-[#F45CAB]">
                  1
                </div>
                <div className="text-left text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-stone-900">We have received your order</span>
                    <span className="text-[10px] text-stone-400 font-mono">now</span>
                  </div>
                  <p className="text-[11px] text-stone-500">Awaiting artisan inspection</p>
                </div>
              </div>

              {/* Notification Overlay 2 */}
              <div className="hidden sm:flex items-center gap-3 absolute top-28 -right-6 bg-white/95 backdrop-blur-md border border-stone-200 p-3 rounded-2xl shadow-xl max-w-xs">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0 bg-[#E13288]">
                  2
                </div>
                <div className="text-left text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-stone-900">Order Accepted</span>
                    <span className="text-[10px] text-stone-400 font-mono">now</span>
                  </div>
                  <p className="text-[11px] text-stone-500">Packed in protective craft crate</p>
                </div>
              </div>

              {/* Notification Overlay 3 */}
              <div className="hidden sm:flex items-center gap-3 absolute -bottom-6 -left-4 bg-white/95 backdrop-blur-md border border-stone-200 p-3 rounded-2xl shadow-xl max-w-xs">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0 bg-[#A93870]">
                  3
                </div>
                <div className="text-left text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-stone-900">Your rider is nearby</span>
                    <span className="text-[10px] text-stone-400 font-mono">now</span>
                  </div>
                  <p className="text-[11px] text-stone-500">Cash on Delivery ready to settle</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. FEATURED SELECTIONS SECTION ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-stone-900 tracking-tight flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-xl text-xs sm:text-sm md:text-base font-extrabold tracking-wide uppercase shadow-xs border bg-[#FFF0F7] text-[#E13288] border-[#F45CAB]/30">
                Special Selection
              </span>
              <span className="text-stone-900">MiniStore exclusive items</span>
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-0.5 -mx-4 px-4 sm:mx-0 sm:px-0 text-xs font-bold no-scrollbar scroll-smooth">
            {['All', 'Footwear', 'Food & Groceries', 'Clothing', 'Home Decor', 'Handicrafts'].map((tab) => {
              const active = dealCategoryFilter === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setDealCategoryFilter(tab)}
                  className={`shrink-0 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border transition-all duration-300 cursor-pointer whitespace-nowrap ${
                    active
                      ? 'border-[#03081E] text-white bg-[#03081E] shadow-md shadow-black/20'
                      : 'border-stone-300 text-stone-600 hover:border-[#03081E] hover:text-[#03081E] bg-white hover:shadow-md'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Featured Deal Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-xl p-4 border border-stone-200 animate-pulse space-y-3">
                <div className="aspect-square bg-stone-100 rounded-lg" />
                <div className="h-4 bg-stone-100 rounded w-2/3" />
                <div className="h-6 bg-stone-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : displayedDeals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {displayedDeals.map((product) => (
              <ProductCard key={product.id} product={product} variant="exclusive-deal" />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center border border-stone-200">
            <p className="text-stone-600 text-sm font-semibold">No items found in this category.</p>
          </div>
        )}
      </section>

      {/* ── 3. MINISTORE POPULAR CATEGORIES ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
            MiniStore Popular Categories
          </h2>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer px-3.5 py-1.5 rounded-full border border-transparent hover:border-stone-200 hover:bg-white hover:shadow-md transition-all duration-300 group text-[#E13288]"
          >
            <span>See All</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5] transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {CATEGORIES_DATA.map((cat) => (
            <CategoryCard
              key={cat.name}
              category={cat.name}
              description={cat.description}
              count={cat.count}
              image={cat.image}
            />
          ))}
        </div>
      </section>

      {/* ── 4. POPULAR CATALOG PRODUCTS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8 gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
              Popular Catalog Items
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Verified inventory ready for doorstep delivery across Pakistan
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-bold text-[#E13288] hover:underline"
          >
            View All ({products.length})
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-xl p-4 border border-stone-200 animate-pulse space-y-3">
                <div className="aspect-square bg-stone-100 rounded-lg" />
                <div className="h-4 bg-stone-100 rounded w-2/3" />
                <div className="h-6 bg-stone-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {popularProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ── 5. DUAL PARTNER CARDS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Partner with us */}
          <div className="relative rounded-3xl overflow-hidden shadow-md h-80 flex flex-col justify-end p-8 bg-stone-950 border border-stone-800 group">
            <div className="absolute inset-0">
              <img
                src="/images/peshawari_chappal_1790952083619.jpg"
                alt="Artisan partner"
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>

            <div className="absolute top-6 left-6 bg-white text-stone-900 text-xs font-bold px-3.5 py-1 rounded-full shadow-md">
              Earn more with lower fees
            </div>

            <div className="relative z-10 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F45CAB]">
                Signup as a merchant or artisan
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Partner with us
              </h3>
              <Link
                to="/products"
                className="inline-block px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm cursor-pointer shadow-md bg-[#F45CAB] hover:bg-[#03081E] text-white transition"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Card 2: Ride with us */}
          <div className="relative rounded-3xl overflow-hidden shadow-md h-80 flex flex-col justify-end p-8 bg-stone-950 border border-stone-800 group">
            <div className="absolute inset-0">
              <img
                src="/images/multani_pottery_vase_1790952099954.jpg"
                alt="Delivery rider"
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>

            <div className="absolute top-6 left-6 bg-white text-stone-900 text-xs font-bold px-3.5 py-1 rounded-full shadow-md">
              Avail exclusive perks
            </div>

            <div className="relative z-10 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F45CAB]">
                Signup as a courier rider
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Ride with us
              </h3>
              <Link
                to="/orders"
                className="inline-block px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm cursor-pointer shadow-md bg-[#F45CAB] hover:bg-[#03081E] text-white transition"
              >
                Get Started
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── 6. "KNOW MORE ABOUT US!" SECTION ── */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#FAF5F8] via-[#FFF9FC] to-[#F8F2F6] border-y border-[#EEDBEC] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10 sm:space-y-12">
          
          {/* Header & Tabs */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between pb-8 border-b border-stone-200/80 gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#F45CAB]/30 shadow-xs text-xs font-bold uppercase tracking-wider text-[#E13288]">
                <Sparkles className="w-3.5 h-3.5 text-[#F45CAB]" />
                <span>Our Story and Operations</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#03081E] tracking-tight">
                Know more about us
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
                Connecting authentic Pakistani heritage crafts, regional harvests, and essentials with homes nationwide through trusted Cash on Delivery.
              </p>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
              {[
                { id: 'Frequent Questions', label: 'Frequent Questions', icon: HelpCircle },
                { id: 'Who we are', label: 'Who we are', icon: Users },
                { id: 'Partner Program', label: 'Partner Program', icon: Handshake },
                { id: 'Help and Support', label: 'Help and Support', icon: PhoneCall },
              ].map((tab) => {
                const active = activeFaqTab === tab.id;
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFaqTab(tab.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-bold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#03081E] text-white border-[#03081E] shadow-md shadow-[#03081E]/20'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-[#03081E] hover:text-[#03081E] hover:bg-stone-50 shadow-xs'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${active ? 'text-[#F45CAB]' : 'text-stone-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB 1: Frequent Questions */}
          {activeFaqTab === 'Frequent Questions' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Accordion Questions */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between px-1 mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Frequently Asked Questions
                  </h3>
                  <span className="text-[11px] font-semibold text-stone-400 font-mono">
                    {FAQ_ITEMS.length} topics
                  </span>
                </div>
                
                {FAQ_ITEMS.map((item, idx) => {
                  const isSelected = activeFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl transition-all duration-200 border ${
                        isSelected
                          ? 'bg-white border-[#F45CAB] shadow-md shadow-[#F45CAB]/10'
                          : 'bg-white/90 hover:bg-white border-stone-200 hover:border-stone-300 shadow-xs'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveFaqIndex(isSelected ? -1 : idx)}
                        className="w-full text-left p-4 font-bold text-xs sm:text-sm text-[#03081E] flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <span className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-[#F45CAB]' : 'bg-stone-300'}`} />
                          <span className="leading-snug">{item.q}</span>
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                            isSelected ? 'rotate-180 text-[#E13288]' : 'text-stone-400'
                          }`}
                        />
                      </button>
                      
                      {isSelected && (
                        <div className="px-5 pb-5 pt-1 text-xs text-stone-600 border-t border-stone-100 mt-1 leading-relaxed">
                          <p>{item.a}</p>
                          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2 text-[11px] font-semibold text-[#E13288]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verified Store Policy</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right: 3 Step Cards */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#03081E] tracking-tight">
                      How MiniStore Delivery Works
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 self-start sm:self-auto">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>100% Cash on Delivery</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Step 1 */}
                  <div className="group bg-[#FAF8F6] hover:bg-white border border-stone-200 hover:border-[#F45CAB]/50 rounded-2xl p-5 text-center flex flex-col items-center justify-between space-y-3 transition-all duration-200 hover:shadow-md">
                    <div className="w-14 h-14 rounded-2xl bg-[#FFF0F7] border border-[#F45CAB]/30 flex items-center justify-center text-[#E13288] shadow-xs group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-stone-900 uppercase tracking-wide">Place an Order</h4>
                      <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                        Add items to cart and checkout in seconds without upfront card payment.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="group bg-[#FAF8F6] hover:bg-white border border-stone-200 hover:border-sky-300 rounded-2xl p-5 text-center flex flex-col items-center justify-between space-y-3 transition-all duration-200 hover:shadow-md">
                    <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-xs group-hover:scale-110 transition-transform">
                      <Clock className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-stone-900 uppercase tracking-wide">Track Progress</h4>
                      <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                        Handcrafted by artisans, packaged securely, and tracked live via courier.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="group bg-[#FAF8F6] hover:bg-white border border-stone-200 hover:border-emerald-300 rounded-2xl p-5 text-center flex flex-col items-center justify-between space-y-3 transition-all duration-200 hover:shadow-md">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-stone-900 uppercase tracking-wide">Get your Order</h4>
                      <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                        Inspect your package upon arrival and pay flat PKR 250 standard delivery.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer card */}
                <div className="bg-[#FAF8F6] rounded-2xl p-4 sm:p-5 border border-stone-200/80 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-xl bg-[#03081E] text-white flex items-center justify-center shrink-0">
                    <Truck className="w-6 h-6 text-[#F45CAB]" />
                  </div>
                  <div className="text-xs text-stone-600 leading-relaxed">
                    <strong className="text-stone-900 font-bold block sm:inline">Flat PKR 250 Standard Delivery: </strong>
                    Enjoy transparent delivery rates across all 180+ Pakistani cities with zero hidden charges and direct payment on delivery.
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Who we are */}
          {activeFaqTab === 'Who we are' && (
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 space-y-8 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E13288]">
                    Celebrating Pakistani Craftsmanship
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#03081E] tracking-tight">
                    Preserving Ancient Guild Traditions With Fair Trade
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    MiniStore connects Pakistan's most gifted master artisans, generational weavers, and high altitude mountain farmers directly with conscious households nationwide.
                  </p>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    By removing exploitative middlemen, our platform guarantees that artisans receive fair earnings while you enjoy authentic Peshawari footwear, natural Ajrak, Hunza valley dry harvests, and Chinioti Sheesham woodwork.
                  </p>
                </div>

                <div className="lg:col-span-5 bg-[#FAF8F6] border border-stone-200 rounded-2xl p-6 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                    Artisan Regional Hubs
                  </h4>
                  <div className="space-y-3 text-xs text-stone-700">
                    <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                      <strong className="text-stone-900 font-bold block">Peshawar, Khyber Pakhtunkhwa</strong>
                      <span className="text-stone-500 text-[11px]">Hand cut genuine leather Peshawari and Kaptaan chappals</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                      <strong className="text-stone-900 font-bold block">Hala and Matiari, Sindh</strong>
                      <span className="text-stone-500 text-[11px]">16-step natural indigo and madder block printed Ajrak shawls</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                      <strong className="text-stone-900 font-bold block">Hunza and Skardu, Gilgit Baltistan</strong>
                      <span className="text-stone-500 text-[11px]">Sun cured mountain apricots, walnuts and pure Pashmina wool</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Pillar Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-stone-100">
                <div className="p-5 rounded-2xl bg-[#FAF8F6] border border-stone-200 text-left space-y-2">
                  <Award className="w-6 h-6 text-[#E13288]" />
                  <h4 className="text-sm font-bold text-stone-900">100% Genuine Handcrafted</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Zero synthetic imitations. Every item is verified for genuine material provenance.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-[#FAF8F6] border border-stone-200 text-left space-y-2">
                  <HeartHandshake className="w-6 h-6 text-[#E13288]" />
                  <h4 className="text-sm font-bold text-stone-900">Direct Fair Wage Trade</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Artisans receive direct profit margins, sustaining traditional regional craft industries.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-[#FAF8F6] border border-stone-200 text-left space-y-2">
                  <ShieldCheck className="w-6 h-6 text-[#E13288]" />
                  <h4 className="text-sm font-bold text-stone-900">Safe Cash on Delivery</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Pay only when the package arrives at your home anywhere in Pakistan.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Partner Program */}
          {activeFaqTab === 'Partner Program' && (
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 space-y-8 shadow-sm">
              <div className="max-w-3xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#E13288]">
                  Guilds and Producers Network
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#03081E] tracking-tight">
                  Sell Your Craft or Regional Harvest on MiniStore
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Are you a Pakistani artisan, family workshop, cooperative, or organic grower? MiniStore provides complete catalog photography, logistics integration, and nationwide access with zero upfront listing fees.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-[#FAF8F6] border border-stone-200 space-y-3">
                  <div className="w-8 h-8 rounded-full bg-[#03081E] text-white flex items-center justify-center text-xs font-mono font-bold">
                    01
                  </div>
                  <h4 className="text-sm font-bold text-stone-900">Submit Your Samples</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Share your catalog and craft details. Our quality audit team reviews material purity and finish.
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-[#FAF8F6] border border-stone-200 space-y-3">
                  <div className="w-8 h-8 rounded-full bg-[#03081E] text-white flex items-center justify-center text-xs font-mono font-bold">
                    02
                  </div>
                  <h4 className="text-sm font-bold text-stone-900">Free Product Listing</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    We feature your products on the MiniStore marketplace with professional descriptions and photography.
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-[#FAF8F6] border border-stone-200 space-y-3">
                  <div className="w-8 h-8 rounded-full bg-[#03081E] text-white flex items-center justify-center text-xs font-mono font-bold">
                    03
                  </div>
                  <h4 className="text-sm font-bold text-stone-900">Fast COD Settlement</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    When orders are fulfilled and delivered, earnings are transferred directly to your bank account weekly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Help and Support */}
          {activeFaqTab === 'Help and Support' && (
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 space-y-8 shadow-sm">
              <div className="max-w-3xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#E13288]">
                  Dedicated Assistance
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#03081E] tracking-tight">
                  Always Here to Assist Your Shopping Journey
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Have a question about your order, delivery timeline, or shoe sizing? Our support representatives are available Monday to Saturday to assist you.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-[#FAF8F6] border border-stone-200 space-y-3">
                  <PhoneCall className="w-7 h-7 text-[#E13288]" />
                  <h4 className="text-sm font-bold text-stone-900">Phone and WhatsApp</h4>
                  <p className="text-xs text-stone-600 font-mono font-bold">+92 333 5187740</p>
                  <p className="text-[11px] text-stone-500">Mon to Sat from 9:00 AM to 8:00 PM PKT</p>
                </div>

                <div className="p-6 rounded-2xl bg-[#FAF8F6] border border-stone-200 space-y-3">
                  <RefreshCw className="w-7 h-7 text-[#E13288]" />
                  <h4 className="text-sm font-bold text-stone-900">Easy 7-Day Exchange</h4>
                  <p className="text-xs text-stone-600">Need a different shoe size or replacement?</p>
                  <p className="text-[11px] text-stone-500">Hassle free exchange for all footwear and crafts.</p>
                </div>

                <div className="p-6 rounded-2xl bg-[#FAF8F6] border border-stone-200 space-y-3">
                  <PackageCheck className="w-7 h-7 text-[#E13288]" />
                  <h4 className="text-sm font-bold text-stone-900">Delivery Inquiries</h4>
                  <p className="text-xs text-stone-600">Standard Delivery Flat PKR 250</p>
                  <p className="text-[11px] text-stone-500">Delivery in 2 to 4 business days nationwide.</p>
                </div>
              </div>
            </div>
          )}

          {/* Full width 4-Value Trust Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div className="bg-white/80 backdrop-blur-sm border border-stone-200/90 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F7] border border-[#F45CAB]/25 flex items-center justify-center text-[#E13288] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-stone-900 block">Cash on Delivery</span>
                <span className="text-[10px] text-stone-500 block">Pay upon safe handover</span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-stone-200/90 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F7] border border-[#F45CAB]/25 flex items-center justify-center text-[#E13288] shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-stone-900 block">Standard Fee PKR 250</span>
                <span className="text-[10px] text-stone-500 block">Flat delivery nationwide</span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-stone-200/90 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F7] border border-[#F45CAB]/25 flex items-center justify-center text-[#E13288] shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-stone-900 block">Artisan Guaranteed</span>
                <span className="text-[10px] text-stone-500 block">100% genuine craftsmanship</span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-stone-200/90 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F7] border border-[#F45CAB]/25 flex items-center justify-center text-[#E13288] shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-stone-900 block">7-Day Replacement</span>
                <span className="text-[10px] text-stone-500 block">Size swap and quality support</span>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
