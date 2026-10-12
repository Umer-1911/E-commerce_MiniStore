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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E9DCE4]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">Order History and Tracking</h1>
          <p className="text-stone-500 text-sm mt-1">
            Track and review your previous purchases.
          </p>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-3" role="status">
          <RefreshCw className="w-8 h-8 animate-spin text-[#F45CAB]" />
          <p className="text-sm text-stone-500 font-medium">Loading your orders...</p>
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
            className="text-xs font-semibold text-rose-800 hover:underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && orders.length === 0 && (
        <div className="bg-white rounded-3xl border border-[#E9DCE4] p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#FFF0F7] text-[#E13288] flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-stone-900">No orders placed yet</h2>
            <p className="text-stone-500 text-sm max-w-sm mx-auto">
              When you place an order with Cash on Delivery, it will appear here for live tracking.
            </p>
          </div>
          <div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F45CAB] hover:bg-[#03081E] text-white text-xs font-bold transition shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Products</span>
            </Link>
          </div>
        </div>
      )}

      {/* Orders List */}
      {!loading && !error && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.order_items?.reduce((sum: number, item) => sum + item.quantity, 0) ?? 0;
            const dateStr = order.created_at
              ? new Date(order.created_at).toLocaleDateString('en-PK', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'Recently';

            return (
              <div
                key={order.id}
                className="bg-white border border-[#E9DCE4] rounded-2xl p-5 sm:p-6 shadow-xs hover:border-[#F45CAB]/50 transition space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-sm font-bold text-stone-900">
                      Order #{order.id}
                    </span>
                    <span className="text-xs text-stone-400">•</span>
                    <span className="text-xs text-stone-500">{dateStr}</span>
                    <span className="text-xs text-stone-400">•</span>
                    <span className="text-xs text-stone-500">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>

                {/* Items preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {order.order_items?.map((item) => {
                    const imgUrl = item.product?.image_path
                      ? resolveImageUrl(item.product.image_path)
                      : null;

                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50/70 border border-stone-100"
                      >
                        <div className="w-12 h-12 rounded-lg bg-white border border-stone-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
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
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-stone-900 truncate">
                            {item.product?.name ?? 'Product'}
                          </p>
                          <p className="text-[11px] text-stone-500 font-mono">
                            Qty: {item.quantity} × {formatPKR(item.price_at_purchase_in_paisa)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Bar: Total & Action Link */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <div>
                    <span className="text-xs text-stone-500 block">Total Amount (COD)</span>
                    <span className="text-base font-black text-[#E13288] font-mono">
                      {formatPKR(order.total_amount_in_paisa)}
                    </span>
                  </div>

                  <Link
                    to={`/orders/${order.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-stone-300 hover:border-[#03081E] hover:bg-[#03081E] hover:text-white text-xs font-bold text-stone-800 transition cursor-pointer shadow-xs"
                  >
                    <span>View Details and Timeline</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
