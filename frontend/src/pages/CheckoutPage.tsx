import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, ShieldAlert, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
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
        <h2 className="text-xl font-bold text-slate-900">Admin Account Detected</h2>
        <p className="text-slate-600 text-sm">
          Administrator accounts cannot create customer orders. Please sign in with a customer account to proceed with checkout.
        </p>
        <div className="pt-2">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition"
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
      <div className="max-w-xl mx-auto my-8 p-12 bg-white rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="inline-flex p-4 bg-indigo-50 text-indigo-500 rounded-full">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Your Cart is Empty</h2>
        <p className="text-slate-500 text-sm">
          Please add items to your cart before proceeding to checkout.
        </p>
        <div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Catalog
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (submitting) return; // double-submit protection

    setSubmitting(true);
    setErrorMessage(null);

    try {
      // Send ONLY product_id and quantity — never trust frontend prices or totals
      const payload = {
        items: items.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
        })),
      };

      const response = await orderService.createOrder(payload);

      // On success, clear the cart and navigate to confirmation
      clearCart();
      navigate('/order-confirmation', {
        state: { order: response.data },
        replace: true,
      });
    } catch (err: unknown) {
      // On failure, preserve cart and show error message
      let msg = 'Failed to place order. Please try again.';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }).response;
        if (res?.data?.errors?.items?.[0]) {
          msg = res.data.errors.items[0];
        } else if (res?.data?.message) {
          msg = res.data.message;
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Review & Checkout</h1>
          <p className="text-slate-500 text-sm mt-1">
            Review your order items and confirm purchase.
          </p>
        </div>
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
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
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
            <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wider text-slate-500">
              Customer Information
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm pt-1">
              <div>
                <span className="font-bold text-slate-800">{user?.name}</span>
                <span className="text-slate-500 block text-xs">{user?.email}</span>
              </div>
              <span className="mt-2 sm:mt-0 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 inline-block w-fit">
                Verified Customer
              </span>
            </div>
          </div>

          {/* Items Review */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wider text-slate-500">
              Order Items ({totalItems})
            </h2>

            <div className="divide-y divide-slate-100">
              {items.map(item => {
                const lineTotal = item.price_in_paisa * item.quantity;

                return (
                  <div key={item.productId} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-slate-50 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-100">
                        <ProductImage
                          imagePath={item.image_path}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          fallbackClassName="w-6 h-6 text-emerald-300"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">{item.name}</p>
                        <p className="text-xs text-slate-500">
                          {formatPKR(item.price_in_paisa)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-800 text-sm whitespace-nowrap">
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
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 sticky top-24 shadow-sm">
            <h2 className="font-black text-slate-900 text-base">Payment & Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-800">{formatPKR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="text-emerald-600 font-semibold">Free Delivery</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Method</span>
                <span className="text-slate-800 font-semibold">Cash on Delivery (COD)</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
              <div>
                <span className="font-black text-slate-800 text-base block">Total Amount</span>
                <span className="text-[11px] text-slate-400">Guaranteed server price</span>
              </div>
              <span className="text-2xl font-black text-emerald-950">{formatPKR(subtotal)}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-[#0b3b2c] hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed transition shadow-md flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Place Order</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              By placing this order, inventory stock will be locked and securely decremented in the database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
