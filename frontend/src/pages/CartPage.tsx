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
  // Standard delivery flat fee in paisa (PKR 250)
  const deliveryFeePaisa = totalItems === 0 ? 0 : 25000;
  const finalTotalPaisa = subtotal + deliveryFeePaisa;

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
        <div className="bg-white p-12 sm:p-16 rounded-3xl border border-[#E9DCE4] text-center space-y-4 shadow-xs">
          <div className="inline-flex p-5 bg-[#FFF0F7] text-[#E13288] rounded-full">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900">Your Basket is Empty</h2>
          <p className="text-stone-500 text-xs sm:text-sm max-w-sm mx-auto">
            Explore our fresh organic groceries, premium lawn wear, and artisan crafts
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold bg-[#F45CAB] hover:bg-[#03081E] text-white transition shadow-sm"
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
      <div className="flex items-center justify-between pb-4 border-b border-[#E9DCE4]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">Shopping Basket</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your basket
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline transition cursor-pointer"
        >
          Clear basket
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
                className="bg-white border border-[#E9DCE4] rounded-2xl p-4 sm:p-5 flex gap-4 transition hover:border-[#F45CAB]/50"
              >
                {/* Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl bg-stone-50 overflow-hidden flex items-center justify-center border border-stone-100">
                  <ProductImage
                    imagePath={item.image_path}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    fallbackClassName="w-8 h-8 text-[#F45CAB]"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1.5 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <Link
                      to={`/products/${item.productId}`}
                      className="font-bold text-stone-900 text-sm sm:text-base hover:text-[#E13288] transition truncate"
                    >
                      {item.name}
                    </Link>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-stone-400 hover:text-rose-600 p-1 transition rounded-lg hover:bg-rose-50 cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-stone-500 font-mono">
                    Unit Price: {formatPKR(item.price_in_paisa)}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-1 border border-stone-200 rounded-xl bg-stone-50 p-0.5">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1 rounded-lg hover:bg-white text-stone-600 disabled:opacity-30 transition cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-stone-900 font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={maxReached}
                        className="p-1 rounded-lg hover:bg-white text-stone-600 disabled:opacity-30 transition cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-black text-sm sm:text-base text-[#E13288]">
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
          <div className="bg-white border border-[#E9DCE4] rounded-3xl p-6 space-y-4 shadow-xs">
            <h2 className="font-black text-stone-900 text-lg">Order Summary</h2>

            <div className="space-y-2 text-xs sm:text-sm text-stone-600 divide-y divide-stone-100">
              <div className="flex justify-between pb-2">
                <span>Items ({totalItems})</span>
                <span className="font-semibold text-stone-900 font-mono">{formatPKR(subtotal)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Standard Delivery Fee</span>
                <span className="font-semibold text-stone-900 font-mono">{formatPKR(deliveryFeePaisa)}</span>
              </div>
              <div className="flex justify-between pt-3 text-base font-black text-stone-900">
                <span>Total</span>
                <span className="text-xl font-black text-[#E13288] font-mono">{formatPKR(finalTotalPaisa)}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 px-4 rounded-full bg-[#028643] hover:bg-[#03081E] text-white font-extrabold text-xs sm:text-sm transition shadow-md cursor-pointer"
            >
              Proceed to Checkout
            </button>

            <div className="space-y-2 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#E13288] flex-shrink-0" />
                <span>Flat PKR 250 standard delivery nationwide</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#E13288] flex-shrink-0" />
                <span>Cash on Delivery payment upon safe handover</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
