import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Minus, Plus, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatPKR } from '../services/productService';
import { ProductImage } from '../components/ProductImage';

export const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalItems, getSubtotal } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const totalItems = getTotalItems();
  const subtotal   = getSubtotal();

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  // ─── Empty State ──────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="bg-white p-12 sm:p-16 rounded-3xl border border-slate-200/90 text-center space-y-4 shadow-xs">
          <div className="inline-flex p-5 bg-emerald-50 text-emerald-600 rounded-full">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800">Your Cart is Empty</h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto">
            Explore our fresh organic groceries, premium lawn wear, and artisan treasures!
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold bg-[#0b3b2c] text-white hover:bg-emerald-800 transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Cart Items ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline transition"
        >
          Clear cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => {
            const lineTotal  = item.price_in_paisa * item.quantity;
            const maxReached = item.quantity >= item.availableStock;

            return (
              <div
                key={item.productId}
                className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex gap-4 transition hover:border-emerald-200"
              >
                {/* Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center border border-slate-100">
                  <ProductImage
                    imagePath={item.image_path}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    fallbackClassName="w-8 h-8 text-emerald-300"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1.5 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <Link
                      to={`/products/${item.productId}`}
                      className="font-bold text-slate-800 text-sm sm:text-base hover:text-emerald-700 transition truncate"
                    >
                      {item.name}
                    </Link>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition rounded-lg hover:bg-rose-50"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-400">
                    Unit Price: {formatPKR(item.price_in_paisa)}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-1 border border-slate-200 rounded-xl bg-slate-50 p-0.5">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30 transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={maxReached}
                        className="p-1 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-extrabold text-sm sm:text-base text-emerald-950">
                      {formatPKR(lineTotal)}
                    </span>
                  </div>

                  {maxReached && (
                    <p className="text-[10px] text-amber-600 font-medium">
                      Maximum available stock reached ({item.availableStock})
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <h2 className="font-black text-slate-900 text-lg">Order Summary</h2>

            <div className="space-y-2 text-xs sm:text-sm text-slate-600 divide-y divide-slate-100">
              <div className="flex justify-between pb-2">
                <span>Items ({totalItems})</span>
                <span className="font-semibold text-slate-900">{formatPKR(subtotal)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between pt-3 text-base font-black text-slate-900">
                <span>Total</span>
                <span className="text-xl font-black text-emerald-950">{formatPKR(subtotal)}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#0b3b2c] hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm transition shadow-md"
            >
              Proceed to Checkout
            </button>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Free delivery across Pakistan</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Cash on delivery payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
