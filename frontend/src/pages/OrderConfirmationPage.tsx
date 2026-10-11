import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight, Package, Calendar, Hash, Clock } from 'lucide-react';
import type { Order } from '../types';
import { formatPKR, resolveImageUrl } from '../services/productService';

export const OrderConfirmationPage: React.FC = () => {
  const location = useLocation();
  const order = (location.state as { order?: Order })?.order;

  if (!order) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-full">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Order Placed</h2>
        <p className="text-slate-500 text-sm">
          Your order was submitted. To view current or past orders, visit My Orders.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/products"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
          >
            Continue Shopping
          </Link>
          <Link
            to="/orders"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Success banner */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-8 text-center space-y-3 shadow-sm">
        <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-full">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Thank You for Your Order!</h1>
        <p className="text-slate-600 text-sm max-w-md mx-auto">
          Your order has been recorded in the database. Stock has been reserved and our team is preparing it.
        </p>
      </div>

      {/* Order Meta Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-slate-100">
          {/* Order ID */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Order Number</p>
              <p className="text-base font-bold text-slate-800">#{order.id}</p>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Order Date</p>
              <p className="text-sm font-semibold text-slate-800">{formattedDate}</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Status</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 capitalize">
                {order.status}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wider text-slate-500">
            Items Ordered
          </h2>

          <div className="divide-y divide-slate-100">
            {order.order_items?.map(item => {
              const imageUrl = resolveImageUrl(item.product?.image_path);
              const lineTotal = item.price_at_purchase_in_paisa * item.quantity;

              return (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.product?.name ?? 'Product'} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">
                        {item.product?.name ?? `Product #${item.product_id}`}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatPKR(item.price_at_purchase_in_paisa)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-slate-800 text-sm whitespace-nowrap">
                    {formatPKR(lineTotal)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Total calculation snapshot */}
        <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
          <span className="text-base font-bold text-slate-800">Total Paid (Cash on Delivery)</span>
          <span className="text-2xl font-extrabold text-indigo-700">
            {formatPKR(order.total_amount_in_paisa)}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <Link
          to="/products"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition shadow-sm"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
        <Link
          to="/orders"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
        >
          <span>My Orders</span>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>
      </div>
    </div>
  );
};
