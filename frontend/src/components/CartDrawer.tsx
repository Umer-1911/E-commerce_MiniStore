import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import type { CartItem } from '../store/useCartStore';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { ProductImage } from './ProductImage';
import { formatPKR } from '../services/productService';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { isCartDrawerOpen, closeCartDrawer } = useAppStore();
  const { items, updateQuantity, removeFromCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  if (!isCartDrawerOpen) return null;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price_in_paisa * item.quantity, 0);
  // Standard Delivery flat fee PKR 250 in paisa (250 * 100)
  const deliveryFeePaisa = totalItems === 0 ? 0 : 25000;
  const finalTotalPaisa = subtotal + deliveryFeePaisa;

  const handleCheckout = () => {
    closeCartDrawer();
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  const handleViewCart = () => {
    closeCartDrawer();
    navigate('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="cart-drawer-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={closeCartDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 flex items-center justify-between text-white bg-[#03081E]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#028643] flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 id="cart-drawer-title" className="text-base font-bold">My Basket</h3>
                <span className="text-xs text-stone-300 font-mono">
                  {totalItems} Items Selected
                </span>
              </div>
            </div>

            <button
              onClick={closeCartDrawer}
              className="text-stone-300 hover:text-white p-1 rounded-md cursor-pointer transition-colors"
              aria-label="Close basket"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-stone-100">
            {items.length === 0 ? (
              <div className="py-16 text-center text-stone-400">
                <ShoppingBag className="w-12 h-12 mx-auto stroke-1 text-stone-300 mb-2" />
                <p className="text-sm font-semibold text-stone-700">Your basket is empty</p>
                <p className="text-xs text-stone-400 mt-1">Explore our catalog and add items</p>
                <button
                  onClick={() => {
                    closeCartDrawer();
                    navigate('/products');
                  }}
                  className="mt-4 px-6 py-2.5 rounded-full text-xs font-bold text-white shadow-md bg-[#F45CAB] hover:bg-[#03081E] transition-all cursor-pointer"
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              items.map((item: CartItem) => (
                <div key={item.productId} className="py-3.5 flex items-start gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-stone-100 border border-stone-200">
                    <ProductImage
                      imagePath={item.image_path}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      fallbackClassName="w-6 h-6 text-emerald-400"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-stone-900 truncate">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-stone-500 font-mono">
                      {formatPKR(item.price_in_paisa)}
                    </p>

                    {/* Stepper */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center bg-stone-100 rounded-md border border-stone-200">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1 text-stone-600 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.availableStock}
                          className="p-1 text-stone-600 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Remove"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right font-mono font-bold text-xs text-stone-900">
                    {formatPKR(item.price_in_paisa * item.quantity)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pricing Summary & Checkout Button */}
          {items.length > 0 && (
            <div className="p-5 border-t border-stone-100 bg-[#FBF9F9] space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-stone-900">
                    {formatPKR(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Standard Delivery Fee</span>
                  <span className="font-mono font-semibold text-stone-900">
                    {formatPKR(deliveryFeePaisa)}
                  </span>
                </div>
              </div>

              {/* Total banner */}
              <div className="p-3.5 rounded-xl flex items-center justify-between text-white font-bold bg-[#E13288]">
                <span className="text-xs uppercase tracking-wider">Total to pay</span>
                <span className="text-lg font-mono tabular-nums">{formatPKR(finalTotalPaisa)}</span>
              </div>

              <p className="text-[11px] text-center text-stone-500 pt-1">
                Cash on Delivery nationwide with item inspection before payment
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleViewCart}
                  className="w-1/3 py-3 px-3 rounded-xl text-stone-800 bg-white border border-stone-300 hover:bg-stone-50 font-bold text-xs transition cursor-pointer"
                >
                  View Cart
                </button>
                <button
                  onClick={handleCheckout}
                  className="flex-1 py-3 px-4 rounded-xl text-white font-bold text-sm bg-[#028643] hover:bg-[#03081E] shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
