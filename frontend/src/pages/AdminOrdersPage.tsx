import React, { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle, Eye, CheckCircle, X, Shield, Package } from 'lucide-react';
import { orderService } from '../services/orderService';
import { formatPKR, resolveImageUrl } from '../services/productService';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { OrderStatusTimeline } from '../components/OrderStatusTimeline';
import type { Order, OrderStatus } from '../types';

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Status updating state: map of orderId -> boolean
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.listAdminOrders();
      setOrders(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load orders.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    setError(null);
    setSuccessMessage(null);
    try {
      const result = await orderService.updateAdminOrderStatus(orderId, newStatus);
      // Update state locally
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: result.data.status } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: result.data.status } : null));
      }
      setSuccessMessage(result.message || `Order #${orderId} status updated to ${newStatus}.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      let msg = 'Failed to update order status.';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }).response;
        if (res?.data?.errors?.status?.[0]) {
          msg = res.data.errors.status[0];
        } else if (res?.data?.message) {
          msg = res.data.message;
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Admin Order Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
              Admin Only
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Review customer orders and update dispatch/delivery lifecycle.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">Error updating orders:</span>
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="p-1 rounded text-rose-400 hover:text-rose-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm text-slate-500 font-medium">Loading orders...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && orders.length === 0 && (
        <div className="bg-white p-16 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="inline-flex p-4 bg-slate-100 text-slate-400 rounded-full">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">No Orders in Database</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            When customers place orders, they will appear here for order processing and tracking.
          </p>
        </div>
      )}

      {/* Orders Table */}
      {!loading && orders.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Order</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Items</th>
                  <th className="px-5 py-3.5">Total</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const isTerminal = order.status === 'completed' || order.status === 'cancelled';
                  const isUpdating = updatingId === order.id;
                  const formattedDate = order.created_at
                    ? new Date(order.created_at).toLocaleDateString('en-PK', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'N/A';
                  const itemsCount =
                    order.order_items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-4 font-bold text-slate-900">#{order.id}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{order.user?.name ?? 'Unknown'}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[180px]">
                          {order.user?.email ?? 'No email'}
                        </p>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
                        {formattedDate}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-600 font-medium">
                        {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap">
                        {formatPKR(order.total_amount_in_paisa)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap space-x-2">
                        {/* Status selector */}
                        <select
                          value={order.status}
                          disabled={isTerminal || isUpdating}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value as OrderStatus)
                          }
                          className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed font-medium text-slate-700"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>

                        {/* View Modal trigger */}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-6 shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-slate-900">
                  Order Details #{selectedOrder.id}
                </h3>
                <OrderStatusBadge status={selectedOrder.status} size="md" />
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Order Lifecycle
              </h4>
              <OrderStatusTimeline status={selectedOrder.status} />
            </div>

            {/* Customer Information */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-1 text-xs border border-slate-200">
              <span className="font-bold text-slate-700 block uppercase tracking-wider">
                Customer Details
              </span>
              <p className="text-sm font-semibold text-slate-800">{selectedOrder.user?.name}</p>
              <p className="text-slate-500">{selectedOrder.user?.email}</p>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Purchased Items
              </span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {selectedOrder.order_items?.map((item) => {
                  const img = resolveImageUrl(item.product?.image_path);
                  return (
                    <div key={item.id} className="p-3 flex items-center justify-between gap-3 bg-white">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {img ? (
                            <img src={img} alt={item.product?.name ?? 'Item'} className="w-full h-full object-cover" />
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
                      <span className="font-bold text-slate-800 text-sm whitespace-nowrap">
                        {formatPKR(item.price_at_purchase_in_paisa * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total and Quick Status Change inside Modal */}
            <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Order Total</span>
                <span className="text-2xl font-extrabold text-indigo-700">
                  {formatPKR(selectedOrder.total_amount_in_paisa)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Update Status:</span>
                <select
                  value={selectedOrder.status}
                  disabled={
                    selectedOrder.status === 'completed' ||
                    selectedOrder.status === 'cancelled' ||
                    updatingId === selectedOrder.id
                  }
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)
                  }
                  className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
