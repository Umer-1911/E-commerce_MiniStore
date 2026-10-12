import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  User,
  Menu,
  X,
  MapPin,
  ChevronDown,
  LogOut,
  PackageCheck,
  Search,
  Tag,
  Shield,
  Package,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useAppStore } from '../store/useAppStore';

const CATEGORY_ITEMS = [
  { name: 'Food & Groceries', path: '/products?category=Food%20%26%20Groceries' },
  { name: 'Clothing', path: '/products?category=Clothing' },
  { name: 'Home Decor', path: '/products?category=Home%20Decor' },
  { name: 'Footwear', path: '/products?category=Footwear' },
  { name: 'Handicrafts', path: '/products?category=Handicrafts' },
];

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const { toggleCartDrawer, deliveryLocation, setDeliveryLocation } = useAppStore();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [headerSearchInput, setHeaderSearchInput] = useState('');
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [newLocationInput, setNewLocationInput] = useState(deliveryLocation);

  const handleLogout = async () => {
    await logout();
    clearCart();                  // wipe persisted cart on sign-out
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearchInput.trim()) {
      navigate(`/products?search=${encodeURIComponent(headerSearchInput.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
    } else {
      navigate('/products');
    }
  };

  const handleLocationSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLocationInput.trim()) {
      setDeliveryLocation(newLocationInput.trim());
      setLocationModalOpen(false);
    }
  };

  return (
    <>
      {/* 1. TOP ANNOUNCEMENT & LOCATION BAR */}
      <aside aria-label="Announcement and location bar" className="bg-[#FAF7F5] border-b border-[#EAE4DC] text-xs text-stone-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2">
          {/* Promo offer without dash punctuation */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-stone-800">
              Get 5% Off your first order, <strong className="text-[#E13288] font-bold">Promo: ORDERS</strong>
            </span>
          </div>

          {/* Location Selector */}
          <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-6">
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs">
              <MapPin className="w-3.5 h-3.5 text-stone-600 shrink-0" />
              <span className="font-medium text-stone-900 truncate max-w-[140px] sm:max-w-[200px]">
                {deliveryLocation}
              </span>
              <button
                type="button"
                onClick={() => setLocationModalOpen(true)}
                className="font-semibold underline ml-1 cursor-pointer text-[#E13288]"
              >
                Change Location
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#EDE6DC] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Mobile Trigger */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-700 hover:text-stone-900 rounded-md"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link
              to="/"
              className="flex items-center gap-1.5 text-left cursor-pointer group"
            >
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900">
                Mini<span className="text-[#F45CAB]">Store</span>
              </span>
            </Link>
          </div>

          {/* Nav Links: Home, Shop, Categories, Deals, Search, Track Order */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 text-xs sm:text-sm font-bold text-stone-700">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-[#F45CAB] text-white shadow-md shadow-[#F45CAB]/30'
                    : 'hover:bg-stone-100 hover:shadow-xs text-stone-800'
                }`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/products"
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-[#F45CAB] text-white shadow-md shadow-[#F45CAB]/30'
                    : 'hover:bg-stone-100 hover:shadow-xs text-stone-800'
                }`
              }
            >
              Shop
            </NavLink>

            {/* Categories with Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className="px-3.5 py-2 rounded-full hover:bg-stone-100 hover:shadow-xs text-stone-800 transition-all duration-300 cursor-pointer inline-flex items-center gap-1"
              >
                <span>Categories</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {categoriesDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl border border-stone-200 shadow-xl py-2 z-50 text-xs font-semibold">
                  <div className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-stone-400 font-bold border-b border-stone-100">
                    Product Categories
                  </div>
                  {CATEGORY_ITEMS.map((cat) => (
                    <Link
                      key={cat.name}
                      to={cat.path}
                      onClick={() => setCategoriesDropdownOpen(false)}
                      className="w-full text-left px-3.5 py-2 hover:bg-stone-50 text-stone-800 flex items-center justify-between"
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-stone-400 font-mono">Explore</span>
                    </Link>
                  ))}
                  <div className="border-t border-stone-100 my-1" />
                  <Link
                    to="/products"
                    onClick={() => setCategoriesDropdownOpen(false)}
                    className="block w-full text-left px-3.5 py-1.5 text-stone-500 hover:text-stone-900 text-[11px]"
                  >
                    View All Collections
                  </Link>
                </div>
              )}
            </div>

            {/* Deals */}
            <Link
              to="/products"
              className="px-3.5 py-2 rounded-full hover:bg-stone-100 hover:shadow-xs text-stone-800 transition-all duration-300 cursor-pointer inline-flex items-center gap-1"
            >
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              <span>Deals</span>
            </Link>

            {/* Search Trigger in Header */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className={`px-3.5 py-2 rounded-full transition-all duration-300 cursor-pointer inline-flex items-center gap-1.5 ${
                searchOpen ? 'bg-stone-100 text-stone-900 shadow-xs' : 'hover:bg-stone-100 hover:shadow-xs text-stone-800'
              }`}
              title="Search catalog"
            >
              <Search className="w-3.5 h-3.5 text-stone-600" />
              <span>Search</span>
            </button>

            {/* Track Order / Orders */}
            {user?.role === 'customer' && (
              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-[#F45CAB] text-white shadow-md shadow-[#F45CAB]/30'
                      : 'hover:bg-stone-100 hover:shadow-xs text-stone-800'
                  }`
                }
              >
                Track Order
              </NavLink>
            )}

            {user?.role === 'admin' && (
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-full transition-all duration-300 cursor-pointer flex items-center gap-1 font-bold ${
                    isActive
                      ? 'bg-[#028643] text-white shadow-md shadow-emerald-900/30'
                      : 'hover:bg-emerald-50 text-emerald-800'
                  }`
                }
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </NavLink>
            )}
          </nav>

          {/* Right Action: Basket Button & User Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Main Header Basket Button (Icon Only, prominent in size) */}
            <button
              type="button"
              onClick={toggleCartDrawer}
              className="relative p-2.5 rounded-full bg-stone-100 hover:bg-[#F45CAB] hover:text-white text-stone-900 shadow-xs hover:shadow-xl hover:shadow-[#F45CAB]/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center group"
              aria-label={`Open basket with ${cartCount} items`}
              title="Shopping Basket"
            >
              <ShoppingBag className="w-5 h-5 stroke-[2.2] group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E13288] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile or Sign In */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-2 px-3 sm:px-4 rounded-full bg-[#03081E] text-white hover:bg-[#F45CAB] text-xs sm:text-sm font-bold shadow-md hover:shadow-xl hover:shadow-[#F45CAB]/25 transition-all duration-300 cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span className="hidden sm:inline truncate max-w-[100px]">{user?.name?.split(' ')[0]}</span>
                  <span className="text-[11px] opacity-75 font-normal">Account</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-stone-200 shadow-xl py-2 z-50 text-xs font-medium">
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <p className="font-bold text-stone-900 text-sm truncate">{user?.role === 'admin' ? 'Store Admin' : user?.name}</p>
                      <p className="text-xs text-stone-400 truncate">{user?.email}</p>
                    </div>

                    {user?.role === 'customer' && (
                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full text-left px-4 py-2 hover:bg-stone-50 flex items-center gap-2 text-stone-700"
                      >
                        <PackageCheck className="w-4 h-4 text-stone-400" />
                        <span>Order History and Tracking</span>
                      </Link>
                    )}

                    {user?.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 text-[#028643] font-bold flex items-center gap-2.5"
                      >
                        <Shield className="w-4 h-4 text-[#028643]" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <div className="border-t border-stone-100 my-0.5" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 hover:bg-rose-50 text-[#e11d48] flex items-center gap-2.5 font-bold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 py-2 px-3 sm:px-4 rounded-full bg-[#03081E] text-white hover:bg-[#F45CAB] text-xs sm:text-sm font-bold shadow-md hover:shadow-xl hover:shadow-[#F45CAB]/25 transition-all duration-300 cursor-pointer shrink-0"
              >
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>

        </div>

        {/* Expanded Header Search Bar */}
        {searchOpen && (
          <div className="border-t border-stone-200 bg-[#FAF7F5] px-4 py-3">
            <div className="max-w-3xl mx-auto flex items-center gap-2">
              <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center bg-white border border-stone-300 rounded-full px-4 py-2 shadow-xs focus-within:ring-2 focus-within:ring-[#F45CAB]">
                <Search className="w-4 h-4 text-stone-400 mr-2 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={headerSearchInput}
                  onChange={(e) => setHeaderSearchInput(e.target.value)}
                  placeholder="Search products by name or category..."
                  className="w-full text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 bg-transparent focus:outline-none"
                />
                {headerSearchInput && (
                  <button
                    type="button"
                    onClick={() => setHeaderSearchInput('')}
                    className="text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>
              <button
                type="submit"
                onClick={handleSearchSubmit}
                className="px-4 py-2 bg-[#03081E] text-white text-xs font-bold rounded-full hover:bg-[#F45CAB] cursor-pointer transition"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-2 text-stone-500 hover:text-stone-800 cursor-pointer"
                title="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-stone-800">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-lg bg-stone-50 text-left hover:bg-stone-100"
              >
                Home
              </Link>
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-lg bg-stone-50 text-left hover:bg-stone-100"
              >
                Shop Catalog
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  toggleCartDrawer();
                }}
                className="p-3 rounded-lg bg-stone-50 text-left hover:bg-stone-100 flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-stone-500" />
                <span>Cart ({cartCount})</span>
              </button>
              {user?.role === 'customer' && (
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-lg bg-stone-50 text-left hover:bg-stone-100 flex items-center gap-1.5"
                >
                  <Package className="w-3.5 h-3.5 text-stone-500" />
                  <span>My Orders</span>
                </Link>
              )}
            </div>

            {/* Category links in mobile menu */}
            <div className="pt-2 border-t border-stone-100">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                Shop by Category
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_ITEMS.map((cat) => (
                  <Link
                    key={cat.name}
                    to={cat.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Location Modal */}
      {locationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-stone-900">Change Delivery Address</h3>
              <button
                type="button"
                onClick={() => setLocationModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleLocationSave} className="space-y-3">
              <input
                type="text"
                value={newLocationInput}
                onChange={(e) => setNewLocationInput(e.target.value)}
                placeholder="e.g. Gulberg III, Lahore, Pakistan"
                className="w-full text-xs border border-stone-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#E13288]"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg text-white font-bold text-xs bg-[#F45CAB] hover:bg-[#E13288] transition cursor-pointer"
              >
                Save Location
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
