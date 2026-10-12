import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight, Package, Calendar, Hash } from 'lucide-react';
import type { Order } from '../types';
import { formatPKR, resolveImageUrl } from '../services/productService';

export const OrderConfirmationPage: React.FC = () => {
  const location = useLocation();
  const order = (location.state as { order?: Order })?.order;

  if (!order) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-[#E9DCE4] text-center space-y-4 shadow-xs">
        <div className="inline-flex p-3 bg-[#FFF0F7] text-[#E13288] rounded-full">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Order Placed</h2>
        <p className="text-stone-500 text-sm">
          Your order was submitted. To view current or past orders, visit My Orders.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/products"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#03081E] hover:bg-[#F45CAB] text-white text-xs font-bold transition"
          >
            Continue Shopping
          </Link>
          <Link
            to="/orders"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 transition"
          >
            My Orders
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Success banner */}
      <div className="bg-white border border-[#E9DCE4] rounded-3xl p-8 text-center space-y-3 shadow-xs">
        <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-full">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-black text-stone-900">Thank You for Your Order!</h1>
        <p className="text-stone-600 text-sm max-w-md mx-auto">
          Your order has been placed successfully via Cash on Delivery. We have reserved your items and begun packaging.
        </p>
      </div>

      {/* Order Meta Card */}
      <div className="bg-white border border-[#E9DCE4] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-stone-400" />
            <span className="text-xs text-stone-500 font-medium">Order Number:</span>
            <span className="font-mono text-sm font-bold text-stone-900">#{order.id}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Calendar className="w-4 h-4 text-stone-400" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Items Summary */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Ordered Items
          </h2>

          <div className="divide-y divide-stone-100">
            {order.order_items?.map((item) => {
              const imgUrl = item.product?.image_path
                ? resolveImageUrl(item.product.image_path)
                : null;
              const lineTotal = item.price_at_purchase_in_paisa * item.quantity;

              return (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-stone-50 border border-stone-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={item.product?.name ?? 'Product'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-stone-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-stone-900 text-xs truncate">
                        {item.product?.name ?? 'Product'}
                      </p>
                      <p className="text-[11px] text-stone-500 font-mono">
                        {formatPKR(item.price_at_purchase_in_paisa)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-[#E13288] text-xs font-mono whitespace-nowrap">
                    {formatPKR(lineTotal)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Total breakdown */}
        <div className="pt-4 border-t border-stone-100 space-y-2 text-xs">
          <div className="flex justify-between text-stone-600">
            <span>Payment Method</span>
            <span className="font-semibold text-stone-900">Cash on Delivery (COD)</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Shipping</span>
            <span className="font-semibold text-emerald-700">Free Standard Delivery</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-stone-100">
            <span className="font-black text-stone-900 text-sm">Total Amount Due</span>
            <span className="text-xl font-black text-[#E13288] font-mono">
              {formatPKR(order.total_amount_in_paisa)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Action buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to={`/orders/${order.id}`}
          className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#03081E] hover:bg-[#F45CAB] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
        >
          <span>Track Order Status</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/products"
          className="w-full sm:w-auto px-6 py-3 rounded-full border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 transition text-center"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};
