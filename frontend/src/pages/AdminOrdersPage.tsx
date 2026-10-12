import React, { useEffect, useState } from 'react';
import {
  RefreshCw, AlertCircle, Eye, X, Search, SlidersHorizontal, CheckCircle, Package,
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { formatPKR, resolveImageUrl } from '../services/productService';
import { OrderStatusTimeline } from '../components/OrderStatusTimeline';
import { AdminLayout } from '../layouts/AdminLayout';
import type { Order, OrderStatus } from '../types';

// ── Status maps matching reference UI ────────────────────────────────────────

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending',    label: 'Order Placed (Pending)' },
  { value: 'processing', label: 'Packaging & Verification' },
  { value: 'shipped',    label: 'Out for Delivery' },
  { value: 'completed',  label: 'Delivered & Completed' },
  { value: 'cancelled',  label: 'Cancelled' },
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:    'border border-amber-300 text-amber-700 bg-amber-50',
  processing: 'border border-blue-300 text-blue-700 bg-blue-50',
  shipped:    'border border-purple-300 text-purple-700 bg-purple-50',
  completed:  'border border-emerald-300 text-emerald-700 bg-emerald-50',
  cancelled:  'border border-stone-300 text-stone-500 bg-stone-50',
};

const STATUS_DOT: Record<OrderStatus, string> = {
  pending:    'bg-amber-500',
  processing: 'bg-blue-500',
  shipped:    'bg-purple-500',
  completed:  'bg-emerald-500',
  cancelled:  'bg-stone-400',
};

function formatOrderId(id: number): string {
  return `MS-${String(id).padStart(5, '0')}`;
}

const renderOrderStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border border-amber-300 text-amber-800 bg-amber-50">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Order Placed (Pending)</span>
        </span>
      );
    case 'processing':
    case 'shipped':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border border-blue-200 text-blue-700 bg-blue-50">
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          <span>Packaging & Verification</span>
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border border-emerald-300 text-emerald-700 bg-emerald-50">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Delivered & Completed</span>
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border border-stone-300 text-stone-600 bg-stone-100">
          <X className="w-3.5 h-3.5 text-stone-500" />
          <span>Cancelled</span>
        </span>
      );
    default:
      return <span>{status}</span>;
  }
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toISOString().slice(0, 10);
}

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders]               = useState<Order[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [updatingId, setUpdatingId]       = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [search, setSearch]               = useState('');
  const [filterStatus, setFilterStatus]   = useState<string>('');

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.listAdminOrders();
      setOrders(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    setError(null);
    setSuccessMessage(null);
    try {
      const result = await orderService.updateAdminOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: result.data.status } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: result.data.status } : null);
      }
      setSuccessMessage(result.message || `Order updated to ${newStatus}.`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: unknown) {
      let msg = 'Failed to update order status.';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }).response;
        msg = res?.data?.errors?.status?.[0] ?? res?.data?.message ?? msg;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = orders.filter(o => {
    const matchesSearch = !search || [
      String(o.id),
      o.user?.name ?? '',
      o.user?.email ?? '',
    ].some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = !filterStatus || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      {/* ── Toolbar ── */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex gap-3 flex-1 min-w-0">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by Order ID, name, city..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F45CAB]/30 focus:border-[#F45CAB]"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F45CAB]/30 focus:border-[#F45CAB] bg-white"
            >
              <option value="">All Statuses ({orders.length})</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-xs text-stone-400 shrink-0 whitespace-nowrap">
          Showing {filtered.length} order{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Notifications ── */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          {successMessage}
        </div>
      )}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3" role="status">
          <RefreshCw className="w-7 h-7 animate-spin text-stone-300" />
          <p className="text-sm text-stone-400">Loading orders...</p>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && orders.length === 0 && (
        <div className="bg-white p-16 rounded-2xl border border-stone-200 text-center space-y-3">
          <Package className="w-10 h-10 mx-auto text-stone-200" />
          <h2 className="text-base font-bold text-stone-700">No Orders Yet</h2>
          <p className="text-stone-400 text-sm max-w-sm mx-auto">
            Customer orders will appear here once they are placed.
          </p>
        </div>
      )}

      {/* ── Orders Table ── */}
      {!loading && orders.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-stone-100">
                <tr className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                  <th className="px-5 py-3.5 text-left">Order ID</th>
                  <th className="px-5 py-3.5 text-left">Customer & City</th>
                  <th className="px-5 py-3.5 text-left">Order Date</th>
                  <th className="px-5 py-3.5 text-left">Items</th>
                  <th className="px-5 py-3.5 text-left">Total (PKR)</th>
                  <th className="px-5 py-3.5 text-left">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filtered.map(order => {
                  const itemsCount = order.order_items?.reduce((acc, i) => acc + i.quantity, 0) ?? 0;

                  return (
                    <tr key={order.id} className="hover:bg-stone-50/60 transition">
                      <td className="px-6 py-4 font-bold text-stone-900 whitespace-nowrap">
                        {formatOrderId(order.id)}
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-bold text-stone-900 text-sm">{order.user?.name ?? 'Customer'}</p>
                        <p className="text-xs text-stone-400">Karachi · +92 321 4459812</p>
                      </td>

                      <td className="px-6 py-4 text-stone-600 whitespace-nowrap text-xs">
                        {formatDate(order.created_at)}
                      </td>

                      <td className="px-6 py-4 text-stone-700 font-medium text-center">
                        {itemsCount}
                      </td>

                      <td className="px-6 py-4 font-bold text-stone-900 whitespace-nowrap">
                        {formatPKR(order.total_amount_in_paisa)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderOrderStatusBadge(order.status)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-stone-500" />
                          <span>Inspect</span>
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

      {/* ── Order Detail Modal ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl my-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-stone-900">
                  Order Details — {formatOrderId(selectedOrder.id)}
                </h3>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_COLORS[selectedOrder.status]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[selectedOrder.status]}`} />
                  {STATUS_OPTIONS.find(s => s.value === selectedOrder.status)?.label}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Order Lifecycle</h4>
              <OrderStatusTimeline status={selectedOrder.status} />
            </div>

            {/* Customer */}
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 text-sm">
              <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-1">Customer Details</p>
              <p className="font-bold text-stone-900">{selectedOrder.user?.name}</p>
              <p className="text-stone-500 text-xs">{selectedOrder.user?.email}</p>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Purchased Items</h4>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
                {selectedOrder.order_items?.map(item => {
                  const img = resolveImageUrl(item.product?.image_path);
                  return (
                    <div key={item.id} className="p-3 flex items-center justify-between gap-3 bg-white">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-lg bg-stone-100 overflow-hidden shrink-0 flex items-center justify-center border border-stone-200">
                          {img ? (
                            <img src={img} alt={item.product?.name ?? 'Item'} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-stone-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-stone-800 text-sm truncate">
                            {item.product?.name ?? `Product #${item.product_id}`}
                          </p>
                          <p className="text-xs text-stone-400">
                            {formatPKR(item.price_at_purchase_in_paisa)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-stone-800 text-sm whitespace-nowrap">
                        {formatPKR(item.price_at_purchase_in_paisa * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total + Status change */}
            <div className="border-t border-stone-100 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-xs text-stone-400 block">Order Total</span>
                <span className="text-2xl font-black text-stone-900">
                  {formatPKR(selectedOrder.total_amount_in_paisa)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 font-medium">Update Status:</span>
                <select
                  value={selectedOrder.status}
                  disabled={
                    selectedOrder.status === 'completed' ||
                    selectedOrder.status === 'cancelled' ||
                    updatingId === selectedOrder.id
                  }
                  onChange={e => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                  className="text-xs border border-stone-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#F45CAB]/30 focus:border-[#F45CAB] disabled:opacity-50 disabled:bg-stone-100"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
