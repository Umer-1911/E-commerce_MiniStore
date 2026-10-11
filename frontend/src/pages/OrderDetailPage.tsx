import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertCircle, Calendar, Hash, Package, ShoppingBag } from 'lucide-react';
import { orderService } from '../services/orderService';
import { formatPKR, resolveImageUrl } from '../services/productService';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { OrderStatusTimeline } from '../components/OrderStatusTimeline';
import type { Order } from '../types';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getOrder(Number(id));
      setOrder(data);
    } catch (err: unknown) {
      let msg = 'Failed to load order details.';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { status?: number; data?: { message?: string } } }).response;
        if (res?.status === 403) {
          msg = 'You are not authorized to view this order.';
        } else if (res?.data?.message) {
          msg = res.data.message;
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm text-slate-500 font-medium">Loading order #{id}...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <div className="inline-flex p-3 bg-rose-50 text-rose-500 rounded-full">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
        <p className="text-slate-500 text-sm">{error ?? 'Unable to find the requested order.'}</p>
        <div className="pt-2">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Orders
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
    : 'Unknown date';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Orders</span>
        </Link>
        <OrderStatusBadge status={order.status} size="md" />
      </div>

      {/* Timeline Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
        <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider text-slate-500">
          Order Status
        </h3>
        <OrderStatusTimeline status={order.status} />
      </div>

      {/* Meta Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-100">
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
              <p className="text-xs text-slate-400 font-medium">Order Placed On</p>
              <p className="text-sm font-semibold text-slate-800">{formattedDate}</p>
            </div>
          </div>
        </div>

        {/* Ordered Items */}
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wider text-slate-500">
            Order Items
          </h2>

          <div className="divide-y divide-slate-100">
            {order.order_items?.map((item) => {
              const imageUrl = resolveImageUrl(item.product?.image_path);
              const lineTotal = item.price_at_purchase_in_paisa * item.quantity;

              return (
                <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.product?.name ?? 'Product'} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-slate-300" />
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
                  <span className="font-bold text-slate-800 text-sm whitespace-nowrap">
                    {formatPKR(lineTotal)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Breakdown */}
        <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Payment Method</span>
            <span className="font-medium text-slate-800">Cash on Delivery</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Shipping</span>
            <span className="text-emerald-600 font-medium">Free Delivery</span>
          </div>
          <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-base">
            <span className="font-bold text-slate-900">Total Amount</span>
            <span className="text-2xl font-extrabold text-indigo-700">
              {formatPKR(order.total_amount_in_paisa)}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-2">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>
    </div>
  );
};
