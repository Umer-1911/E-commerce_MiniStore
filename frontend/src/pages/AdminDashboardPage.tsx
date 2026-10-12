import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  ChevronRight,
  RefreshCw,
  CheckCircle,
  X,
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { useProductStore } from '../store/useProductStore';
import { formatPKR } from '../services/productService';
import { AdminLayout } from '../layouts/AdminLayout';
import type { Order, Product, OrderStatus } from '../types';


const renderStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border border-amber-300 text-amber-800 bg-amber-50">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
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

function formatOrderId(id: number): string {
  return `MS-${String(id).padStart(5, '0')}`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toISOString().slice(0, 10);
}

export const AdminDashboardPage: React.FC = () => {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { catalog, fetchCatalog } = useProductStore();

  useEffect(() => {
    (async () => {
      try {
        const data = await orderService.listAdminOrders();
        setOrders(data);
      } catch {
        // silently fail — dashboard is informational
      } finally {
        setLoading(false);
      }
    })();
    fetchCatalog({ per_page: 50, sort_by: 'stock_quantity', sort_dir: 'asc' });
  }, [fetchCatalog]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalOrders    = orders.length;
  const totalInventory = catalog?.total ?? 0;
  const pendingOrders  = orders.filter(o => o.status === 'pending').length;
  const lowStock       = (catalog?.data ?? []).filter(p => p.stock_quantity > 0 && p.stock_quantity < 10);
  const recentOrders   = [...orders].sort((a, b) =>
    new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
  ).slice(0, 5);

  return (
    <AdminLayout>
      {/* ── 4 Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="TOTAL ORDERS"
          value={loading ? '…' : String(totalOrders)}
          sub="Recorded customer transactions"
          icon={<ShoppingCart className="w-4 h-4 text-stone-400" />}
        />
        <StatCard
          label="TOTAL INVENTORY"
          value={String(totalInventory)}
          sub="Active artisan catalog lines"
          icon={<Package className="w-4 h-4 text-stone-400" />}
        />
        <StatCard
          label="PENDING ORDERS"
          value={loading ? '…' : String(pendingOrders)}
          sub="Awaiting dispatch verification"
          icon={<Clock className="w-4 h-4 text-amber-500" />}
          highlight="amber"
        />
        <StatCard
          label="LOW-STOCK ALERT"
          value={String(lowStock.length)}
          sub="< 10 units remaining in stock"
          icon={<AlertTriangle className="w-4 h-4 text-rose-500" />}
          highlight="rose"
        />
      </div>

      {/* ── Main content: Recent Orders + Low Inventory ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between border-b border-stone-100">
            <div>
              <h2 className="font-black text-stone-900 text-base">Recent Orders</h2>
              <p className="text-xs text-stone-400 mt-0.5">Latest domestic customer orders in Pakistan</p>
            </div>
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-bold text-stone-700 border border-stone-200 px-3.5 py-1.5 rounded-lg hover:bg-stone-50 transition"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              All Orders
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-stone-300" />
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-center text-stone-400 py-12 text-sm">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-stone-100 text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                    <th className="px-6 py-3.5 text-left">ORDER ID</th>
                    <th className="px-6 py-3.5 text-left">CUSTOMER</th>
                    <th className="px-6 py-3.5 text-left">DATE</th>
                    <th className="px-6 py-3.5 text-left">TOTAL (PKR)</th>
                    <th className="px-6 py-3.5 text-left">STATUS</th>
                    <th className="px-6 py-3.5 text-left">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-stone-50/60 transition">
                      <td className="px-6 py-4 font-bold text-stone-900">{formatOrderId(order.id)}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-stone-900 text-[13px]">{order.user?.name ?? 'Unknown'}</p>
                        <p className="text-stone-400 text-[11px]">Karachi</p>
                      </td>
                      <td className="px-6 py-4 text-stone-500 whitespace-nowrap">{formatDate(order.created_at)}</td>
                      <td className="px-6 py-4 font-bold text-stone-900 whitespace-nowrap">
                        {formatPKR(order.total_amount_in_paisa)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to="/admin/orders"
                          className="text-stone-600 hover:text-stone-900 font-bold flex items-center gap-0.5 text-xs"
                        >
                          Manage
                          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Inventory Notice */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 flex items-center justify-between border-b border-stone-100">
              <div>
                <h2 className="font-black text-stone-900 text-base">Low Inventory Notice</h2>
                <p className="text-xs text-stone-400 mt-0.5">Items nearing stock-out</p>
              </div>
              <Link
                to="/admin/products"
                className="text-xs font-bold text-stone-700 border border-stone-200 px-3.5 py-1.5 rounded-lg hover:bg-stone-50 transition"
              >
                Inventory
              </Link>
            </div>

            <div className="divide-y divide-stone-50">
              {lowStock.slice(0, 5).map(product => (
                <LowStockRow key={product.id} product={product} />
              ))}
              {lowStock.length === 0 && (
                <p className="text-center text-stone-400 py-8 text-sm">All items are well-stocked.</p>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-stone-100">
            <Link
              to="/admin/products"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#f3f4f6] hover:bg-stone-200 text-xs font-bold text-stone-800 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New Product Line
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  highlight?: 'amber' | 'rose';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon, highlight }) => (
  <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <span className={`text-[10px] font-bold uppercase tracking-wider ${
        highlight === 'amber' ? 'text-amber-600' :
        highlight === 'rose'  ? 'text-rose-600'  : 'text-stone-500'
      }`}>
        {label}
      </span>
      {icon}
    </div>
    <p className={`text-3xl sm:text-4xl font-black tracking-tight ${
      highlight === 'amber' ? 'text-amber-600' :
      highlight === 'rose'  ? 'text-rose-600'  : 'text-stone-900'
    }`}>
      {value}
    </p>
    <p className="text-[11px] text-stone-400">{sub}</p>
  </div>
);

const LowStockRow: React.FC<{ product: Product }> = ({ product }) => (
  <div className="px-6 py-4 flex items-center justify-between gap-3">
    <div className="min-w-0">
      <p className="text-xs font-bold text-stone-900 truncate">{product.name}</p>
      <p className="text-[11px] text-stone-400 truncate">
        Pakistan · {product.category ?? 'Handicrafts'}
      </p>
    </div>
    <span className="shrink-0 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#fff0f3] text-[#e02424] border border-rose-200">
      {product.stock_quantity} left
    </span>
  </div>
);
