import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, AlertCircle, RefreshCw, ChevronRight, Package } from 'lucide-react';
import { orderService } from '../services/orderService';
import { formatPKR, resolveImageUrl } from '../services/productService';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import type { Order } from '../types';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.listOrders();
      setOrders(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load order history.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
          <p className="text-slate-500 text-sm mt-1">
            Track and review your previous purchases.
          </p>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm text-slate-500 font-medium">Loading your orders...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
          <div className="flex-1">
            <span className="font-semibold block">Failed to load orders:</span>
            <span>{error}</span>
          </div>
          <button
            onClick={fetchOrders}
            className="px-3 py-1 bg-white border border-rose-300 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && orders.length === 0 && (
        <div className="bg-white p-16 rounded-2xl border border-slate-200 text-center space-y-4">
          <div className="inline-flex p-5 bg-indigo-50 text-indigo-500 rounded-full">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">No Orders Yet</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            You haven't placed any orders yet. Discover our quality products and place your first order today!
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse Products
            </Link>
          </div>
        </div>
      )}

      {/* Orders List */}
      {!loading && !error && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => {
            const formattedDate = order.created_at
              ? new Date(order.created_at).toLocaleDateString('en-PK', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'Unknown date';

            const itemsCount = order.order_items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0;

            return (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-xs text-slate-400 font-medium">Order Number</span>
                      <p className="text-base font-bold text-slate-900">#{order.id}</p>
                    </div>
                    <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                    <div>
                      <span className="text-xs text-slate-400 font-medium">Date Placed</span>
                      <p className="text-sm font-semibold text-slate-700">{formattedDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.status} size="md" />
                    <Link
                      to={`/orders/${order.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Items preview */}
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {order.order_items?.slice(0, 4).map((item) => {
                      const img = resolveImageUrl(item.product?.image_path);
                      return (
                        <div
                          key={item.id}
                          className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center"
                          title={`${item.product?.name ?? 'Item'} (${item.quantity}x)`}
                        >
                          {img ? (
                            <img src={img} alt={item.product?.name ?? 'Product'} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                      );
                    })}
                    {(order.order_items?.length ?? 0) > 4 && (
                      <span className="text-xs font-semibold text-slate-400 px-2">
                        +{(order.order_items?.length ?? 0) - 4} more
                      </span>
                    )}
                    <span className="text-xs text-slate-500 ml-2">
                      {itemsCount} {itemsCount === 1 ? 'item' : 'items'} total
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Order Total</span>
                    <span className="text-lg font-bold text-indigo-700">
                      {formatPKR(order.total_amount_in_paisa)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
