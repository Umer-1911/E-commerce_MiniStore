import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertCircle, Calendar, Hash, Package } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center py-20 space-y-3" role="status">
        <RefreshCw className="w-8 h-8 animate-spin text-[#F45CAB]" />
        <p className="text-sm text-stone-500 font-medium">Loading order #{id}...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-[#E9DCE4] text-center space-y-4 shadow-xs">
        <div className="inline-flex p-3 bg-rose-50 text-rose-500 rounded-full">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Unable to load order</h2>
        <p className="text-stone-600 text-sm">{error}</p>
        <div className="pt-2">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#03081E] text-white rounded-full text-xs font-bold hover:bg-[#F45CAB] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Orders</span>
          </Link>
        </div>
      </div>
    );
  }

  const dateStr = order.created_at
    ? new Date(order.created_at).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently';

  const itemCount = order.order_items?.reduce((sum: number, item) => sum + item.quantity, 0) ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb / Back Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E9DCE4]">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-700 hover:text-[#E13288] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Main Order Header Card */}
      <div className="bg-white border border-[#E9DCE4] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <Hash className="w-3.5 h-3.5" />
              <span>Order Reference</span>
            </div>
            <h1 className="text-2xl font-black text-stone-900 font-mono">
              Order #{order.id}
            </h1>
          </div>

          <div className="flex flex-col sm:items-end text-xs text-stone-500">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>Placed on {dateStr}</span>
            </div>
            <span className="text-[11px] text-stone-400 mt-0.5">
              Cash on Delivery (COD) Nationwide
            </span>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Fulfillment Progress
          </h2>
          <OrderStatusTimeline status={order.status} />
        </div>
      </div>

      {/* Items & Payment Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#E9DCE4] rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
              <span>Ordered Items ({itemCount})</span>
            </h2>

            <div className="divide-y divide-stone-100">
              {order.order_items?.map((item) => {
                const imgUrl = item.product?.image_path
                  ? resolveImageUrl(item.product.image_path)
                  : null;
                const lineTotal = item.price_at_purchase_in_paisa * item.quantity;

                return (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-16 h-16 rounded-xl bg-stone-50 border border-stone-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={item.product?.name ?? 'Product'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-stone-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={item.product_id ? `/products/${item.product_id}` : '#'}
                          className="font-bold text-stone-900 text-sm hover:text-[#E13288] transition truncate block"
                        >
                          {item.product?.name ?? 'Product item'}
                        </Link>
                        {item.product?.category && (
                          <span className="text-[11px] text-[#A93870] font-semibold">
                            {item.product.category}
                          </span>
                        )}
                        <p className="text-xs text-stone-500 font-mono mt-0.5">
                          {formatPKR(item.price_at_purchase_in_paisa)} × {item.quantity}
                        </p>
                      </div>
                    </div>

                    <span className="font-black text-[#E13288] text-sm whitespace-nowrap font-mono">
                      {formatPKR(lineTotal)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Payment breakdown */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-[#E9DCE4] rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Payment Summary
            </h2>

            <div className="space-y-3 text-xs text-stone-600 divide-y divide-stone-100">
              <div className="flex justify-between pb-2">
                <span>Items Subtotal</span>
                <span className="font-semibold text-stone-900 font-mono">
                  {formatPKR(order.total_amount_in_paisa)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span>Shipping Fee</span>
                <span className="font-semibold text-emerald-700">Free Standard COD</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Payment Method</span>
                <span className="font-semibold text-stone-900">Cash on Delivery</span>
              </div>
              <div className="flex justify-between pt-3 text-sm font-black text-stone-900">
                <span>Total Amount Due</span>
                <span className="text-lg text-[#E13288] font-mono">
                  {formatPKR(order.total_amount_in_paisa)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
