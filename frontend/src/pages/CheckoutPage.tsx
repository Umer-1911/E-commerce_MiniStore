import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, ShieldAlert, AlertCircle, Loader2, CheckCircle2, ShieldCheck, Truck } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { orderService } from '../services/orderService';
import { formatPKR } from '../services/productService';
import { ProductImage } from '../components/ProductImage';

export const CheckoutPage: React.FC = () => {
  const { items, clearCart, getTotalItems, getSubtotal } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalItems = getTotalItems();
  const subtotal = getSubtotal();

  // If user is admin, block ordering
  if (user?.role === 'admin') {
    return (
      <div className="max-w-xl mx-auto my-8 p-8 bg-white rounded-2xl border border-amber-200 shadow-sm text-center space-y-4">
        <div className="inline-flex p-3 bg-amber-50 text-amber-600 rounded-full">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Admin Account Detected</h2>
        <p className="text-stone-600 text-sm">
          Administrator accounts cannot create customer orders. Please sign in with a customer account to proceed with checkout.
        </p>
        <div className="pt-2">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#03081E] text-white rounded-full text-xs font-semibold hover:bg-[#F45CAB] transition"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // If cart is empty
  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-8 p-12 bg-white rounded-2xl border border-[#E9DCE4] shadow-sm text-center space-y-4">
        <div className="inline-flex p-4 bg-[#FFF0F7] text-[#E13288] rounded-full">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Your Basket is Empty</h2>
        <p className="text-stone-500 text-sm">
          Please add items to your cart before proceeding to checkout.
        </p>
        <div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#F45CAB] hover:bg-[#03081E] text-white rounded-full text-xs font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const orderPayload = {
        items: items.map(i => ({
          product_id: i.productId,
          quantity: i.quantity,
        })),
      };

      const response = await orderService.createOrder(orderPayload);
      clearCart();
      navigate('/order-confirmation', {
        state: { order: response.data },
        replace: true,
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to place order. Please review your cart items and try again.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E9DCE4]">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Review and Checkout</h1>
          <p className="text-stone-500 text-sm mt-1">
            Review your order items and confirm purchase.
          </p>
        </div>
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-[#E13288] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Basket</span>
        </Link>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <div>
            <span className="font-semibold block">Order Failed:</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer details & Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Card */}
          <div className="bg-white border border-[#E9DCE4] rounded-2xl p-5 space-y-2">
            <h2 className="font-semibold text-xs uppercase tracking-wider text-stone-500">
              Customer Information
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm pt-1">
              <div>
                <span className="font-bold text-stone-900">{user?.name}</span>
                <span className="text-stone-500 block text-xs">{user?.email}</span>
              </div>
              <span className="mt-2 sm:mt-0 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block w-fit">
                Verified Customer
              </span>
            </div>
          </div>

          {/* Items Review */}
          <div className="bg-white border border-[#E9DCE4] rounded-2xl p-5 space-y-4">
            <h2 className="font-semibold text-xs uppercase tracking-wider text-stone-500">
              Order Items ({totalItems})
            </h2>

            <div className="divide-y divide-stone-100">
              {items.map(item => {
                const lineTotal = item.price_in_paisa * item.quantity;

                return (
                  <div key={item.productId} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-stone-50 overflow-hidden flex-shrink-0 flex items-center justify-center border border-stone-100">
                        <ProductImage
                          imagePath={item.image_path}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          fallbackClassName="w-6 h-6 text-[#F45CAB]"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-stone-900 text-sm truncate">{item.name}</p>
                        <p className="text-xs text-stone-500 font-mono">
                          {formatPKR(item.price_in_paisa)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-[#E13288] text-sm whitespace-nowrap font-mono">
                      {formatPKR(lineTotal)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Place Order */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-[#E9DCE4] rounded-3xl p-6 space-y-5 sticky top-24 shadow-xs">
            <h2 className="font-black text-stone-900 text-base">Payment and Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-stone-900 font-mono">{formatPKR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                <span className="text-emerald-700 font-semibold">Standard COD</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Payment Method</span>
                <span className="text-stone-900 font-semibold">Cash on Delivery (COD)</span>
              </div>
            </div>

            <div className="border-t border-stone-100 pt-4 flex justify-between items-center">
              <div>
                <span className="font-black text-stone-900 text-base block">Total Amount</span>
                <span className="text-[11px] text-stone-400">Guaranteed server price</span>
              </div>
              <span className="text-2xl font-black text-[#E13288] font-mono">{formatPKR(subtotal)}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="w-full py-3.5 rounded-full bg-[#028643] hover:bg-[#03081E] text-white font-extrabold text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Place Order (Cash on Delivery)</span>
                </>
              )}
            </button>

            <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 space-y-1.5">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#E13288] shrink-0" />
                <span>Pay to courier rider upon package inspection</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#E13288] shrink-0" />
                <span>Verified inventory reservation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
