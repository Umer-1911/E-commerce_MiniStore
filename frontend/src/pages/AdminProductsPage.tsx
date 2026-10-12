import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Package, Pencil, Plus, Trash2, X, Upload, AlertCircle, Search, SlidersHorizontal, Check } from 'lucide-react';
import { useProductStore } from '../store/useProductStore';
import { formatPKR, resolveImageUrl } from '../services/productService';
import { ProductImage } from '../components/ProductImage';
import { AdminLayout } from '../layouts/AdminLayout';
import type { Product, ProductFormPayload } from '../types';

// ── Constants ──────────────────────────────────────────────────────────────────

const CATEGORIES = ['Clothing', 'Food & Groceries', 'Home Decor', 'Footwear', 'Handicrafts', 'Snacks'];

const IMAGE_PRESETS = [
  { label: 'Peshawari Chappal', path: '/images/peshawari_chappal_1790952083619.jpg' },
  { label: 'Embroidered Kurti', path: '/images/embroidered_kurti_1790952127717.jpg' },
  { label: 'Multani Ceramic Pottery', path: '/images/multani_pottery_vase_1790952099954.jpg' },
  { label: 'Hunza Dry Fruits', path: '/images/hunza_dry_fruits_1790952113079.jpg' },
  { label: 'Artisan Composition', path: '/images/hero_pakistani_crafts_1790952064704.jpg' },
];

const ORIGIN_MAP: Record<string, string> = {
  'Handcrafted Peshawari Chappal': 'Namak Mandi, Peshawar',
  'Embroidered Cotton Kurti': 'Anarkali, Lahore',
  'Hunza Organic Dry Fruits Assortment': 'Karimabad, Hunza Valley',
  "Lay's Classic Salted Potato Chips (50g)": 'gulshan super store, lahore',
  'Multani Ceramic Blue Pottery Vase': 'Kashigari Guild, Multan',
  'Super Kernel Basmati Rice (5kg Vintage Crop)': 'chenab basin, gujranwala',
  'Pure Organic Beri Honey': 'Wild Jujube Forests, Potohar',
};

const EMPTY_FORM: ProductFormPayload = {
  name: '',
  description: '',
  category: '',
  price_in_paisa: 0,
  stock_quantity: 0,
  image: null,
};

// ── ProductForm (Add / Edit modal body) ────────────────────────────────────────

interface ProductFormProps {
  initial?: Partial<ProductFormPayload> & { image_path?: string | null };
  onSubmit: (payload: ProductFormPayload) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  busy: boolean;
  serverError: string | null;
  isEdit?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  initial, onSubmit, onCancel, submitLabel, busy, serverError, isEdit,
}) => {
  const [form, setForm] = useState<ProductFormPayload>({
    ...EMPTY_FORM, ...initial, image: null,
  });
  const [pkrDisplay, setPkrDisplay] = useState(
    initial?.price_in_paisa ? String(initial.price_in_paisa / 100) : ''
  );
  const [preview, setPreview] = useState<string | null>(resolveImageUrl(initial?.image_path));
  const fileRef               = useRef<HTMLInputElement>(null);
  const [errors, setErrors]   = useState<Partial<Record<keyof ProductFormPayload, string>>>({});

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Product title is required.';
    if (form.price_in_paisa < 0 || isNaN(form.price_in_paisa)) e.price_in_paisa = 'Price must be 0 or more.';
    if (form.stock_quantity < 0 || isNaN(form.stock_quantity)) e.stock_quantity = 'Stock must be 0 or more.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePriceChange = (raw: string) => {
    setPkrDisplay(raw);
    const parsed = parseFloat(raw);
    setForm(f => ({ ...f, price_in_paisa: isNaN(parsed) ? 0 : Math.round(parsed * 100) }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setForm(f => ({ ...f, image: file }));
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {serverError}
        </div>
      )}

      {/* Product Title */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1">Product Title *</label>
        <input
          type="text"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F45CAB]/40 focus:border-[#F45CAB] placeholder:text-stone-400"
          placeholder="e.g. Handcrafted Khussa Footwear"
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>

      {/* Category + Origin (2 cols) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1">Department / Category *</label>
          <select
            value={form.category ?? ''}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F45CAB]/40 focus:border-[#F45CAB] bg-white"
          >
            <option value="">Select category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1">Regional Origin *</label>
          <input
            type="text"
            value={(form as ProductFormPayload & { origin?: string }).origin ?? ''}
            onChange={() => {/* origin not in schema — visual only */}}
            className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F45CAB]/40 focus:border-[#F45CAB] placeholder:text-stone-400"
            placeholder="Peshawar, Khyber Pakhtunkhwa"
          />
        </div>
      </div>

      {/* Price + Stock (2 cols) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1">Price in PKR *</label>
          <input
            type="number"
            value={pkrDisplay}
            onChange={e => handlePriceChange(e.target.value)}
            min={0}
            step={1}
            className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F45CAB]/40 focus:border-[#F45CAB]"
            placeholder="3500"
          />
          {errors.price_in_paisa && <p className="text-xs text-red-500 mt-1">{errors.price_in_paisa}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1">Inventory Stock Quantity *</label>
          <input
            type="number"
            value={form.stock_quantity}
            onChange={e => setForm(f => ({ ...f, stock_quantity: Number(e.target.value) }))}
            min={0}
            className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F45CAB]/40 focus:border-[#F45CAB]"
            placeholder="15"
          />
          {errors.stock_quantity && <p className="text-xs text-red-500 mt-1">{errors.stock_quantity}</p>}
        </div>
      </div>

      {/* Short Summary */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1">Short Summary</label>
        <input
          type="text"
          value={''}
          onChange={() => {/* not in schema */}}
          className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F45CAB]/40 focus:border-[#F45CAB] placeholder:text-stone-400"
          placeholder="One-line summary for product cards..."
        />
      </div>

      {/* Detailed Description */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1">Detailed Craftsmanship Description *</label>
        <textarea
          value={form.description ?? ''}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={4}
          className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F45CAB]/40 focus:border-[#F45CAB] resize-none placeholder:text-stone-400"
          placeholder="Details about materials, artisan technique, and provenance..."
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-2">Product Image Preview & Presets</label>
        <div className="flex gap-4 items-start">
          {/* Thumbnail */}
          <div
            className="w-20 h-20 rounded-lg border-2 border-dashed border-stone-300 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-[#F45CAB] transition"
            onClick={() => fileRef.current?.click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <Upload className="w-6 h-6 text-stone-400" />
            )}
          </div>

          {/* Path input & Presets */}
          <div className="flex-1 space-y-2.5">
            <div>
              <label className="block text-xs text-stone-600 font-bold mb-1">Image Asset Path</label>
              <input
                type="text"
                readOnly
                value={form.image ? form.image.name : (preview ?? '/src/assets/images/peshawari_chappal_1790952083619.jpg')}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-600 bg-white focus:outline-none cursor-pointer"
                onClick={() => fileRef.current?.click()}
              />
            </div>

            {/* Quick Select Buttons */}
            <div>
              <p className="text-[11px] text-stone-400 font-medium mb-1.5">Quick Select:</p>
              <div className="flex flex-wrap gap-1.5">
                {IMAGE_PRESETS.map((preset, idx) => {
                  const isSelected = preview === preset.path || (!preview && idx === 0);
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setPreview(preset.path)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#0f382c] text-white shadow-xs'
                          : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy}
          className="px-6 py-2.5 rounded-xl bg-[#F45CAB] hover:bg-[#E13288] text-white text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
        >
          {busy ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          <span>{submitLabel || (isEdit ? 'Save Changes' : 'Create Product')}</span>
        </button>
      </div>
    </form>
  );
};

// ── Product modal overlay ──────────────────────────────────────────────────────

interface ProductModalProps { title: string; onClose: () => void; children: React.ReactNode }
const ProductModal: React.FC<ProductModalProps> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8 overflow-y-auto">
    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl my-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
        <h2 className="font-bold text-stone-900 text-base">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-stone-100 transition text-stone-400 hover:text-stone-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

export const AdminProductsPage: React.FC = () => {
  const {
    catalog, catalogLoading, fetchCatalog,
    mutating, mutateError, clearMutateError,
    createProduct, updateProduct, deleteProduct,
  } = useProductStore();

  const [showCreate, setShowCreate]     = useState(false);
  const [editProduct, setEditProduct]   = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteError, setDeleteError]   = useState<string | null>(null);
  const [page, setPage]                 = useState(1);
  const [search, setSearch]             = useState('');
  const [filterCat, setFilterCat]       = useState('');

  const load = useCallback(() => {
    fetchCatalog({
      per_page: 20, page,
      sort_by: 'created_at', sort_dir: 'desc',
      search: search || undefined,
      category: filterCat || undefined,
    });
  }, [fetchCatalog, page, search, filterCat]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (payload: ProductFormPayload) => {
    try {
      await createProduct(payload);
      setShowCreate(false);
      load();
    } catch { /* mutateError handled in store */ }
  };

  const handleUpdate = async (payload: ProductFormPayload) => {
    if (!editProduct) return;
    try {
      await updateProduct(editProduct.id, payload);
      setEditProduct(null);
      load();
    } catch { /* mutateError handled in store */ }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
      const remaining = (catalog?.data.length ?? 1) - 1;
      if (remaining <= 0 && page > 1) setPage(p => p - 1);
      else load();
    } catch (err) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Could not delete.'
        : 'Could not delete.';
      setDeleteError(msg);
    }
  };

  return (
    <AdminLayout>
      {/* ── Toolbar ── */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 flex flex-col sm:flex-row gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search catalog by title, origin..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F45CAB]/30 focus:border-[#F45CAB]"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
          <select
            value={filterCat}
            onChange={e => { setFilterCat(e.target.value); setPage(1); }}
            className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F45CAB]/30 focus:border-[#F45CAB] bg-white"
          >
            <option value="">All Departments</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Add button */}
        <button
          type="button"
          onClick={() => { clearMutateError(); setShowCreate(true); }}
          className="shrink-0 flex items-center gap-2 px-5 py-2 bg-[#F45CAB] hover:bg-[#E13288] text-white rounded-full text-xs font-bold transition shadow-sm cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add Product Line
        </button>
      </div>

      {/* ── Loading ── */}
      {catalogLoading && (
        <div className="flex justify-center py-16" role="status">
          <Loader2 className="w-8 h-8 animate-spin text-[#F45CAB]" />
        </div>
      )}

      {/* ── Products Table ── */}
      {!catalogLoading && catalog && (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-stone-100">
                <tr className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                  <th className="px-5 py-3.5 text-left">Item</th>
                  <th className="px-5 py-3.5 text-left">Category</th>
                  <th className="px-5 py-3.5 text-left">Origin</th>
                  <th className="px-5 py-3.5 text-left">Price (PKR)</th>
                  <th className="px-5 py-3.5 text-left">Stock</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {catalog.data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-stone-400">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No products match your filters.</p>
                    </td>
                  </tr>
                )}
                {catalog.data.map(p => (
                  <tr key={p.id} className="hover:bg-stone-50/60 transition">
                    {/* Item: thumbnail + name + description */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-stone-100 bg-stone-50 shrink-0">
                          <ProductImage
                            imagePath={p.image_path}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            fallbackClassName="w-4 h-4 text-stone-300"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-stone-900 text-[13px] truncate max-w-[200px]">{p.name}</p>
                          <p className="text-xs text-stone-400 truncate max-w-[200px]">
                            {p.description ? p.description.slice(0, 50) + (p.description.length > 50 ? '...' : '') : 'No description'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3.5 text-xs text-stone-700 font-medium">
                      {p.category ?? 'Uncategorized'}
                    </td>

                    {/* Origin */}
                    <td className="px-5 py-3.5 text-xs text-stone-600">
                      {ORIGIN_MAP[p.name] ?? 'Punjab, Pakistan'}
                    </td>

                    {/* Price */}
                    <td className="px-5 py-3.5 font-bold text-stone-900 whitespace-nowrap">
                      {formatPKR(p.price_in_paisa)}
                    </td>

                    {/* Stock */}
                    <td className="px-5 py-3.5">
                      <span className={`font-semibold text-sm ${
                        p.stock_quantity === 0
                          ? 'text-rose-600'
                          : p.stock_quantity < 10
                            ? 'text-amber-600'
                            : 'text-stone-700'
                      }`}>
                        {p.stock_quantity} units
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => { clearMutateError(); setEditProduct(p); }}
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition"
                          title="Edit product"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => { setDeleteError(null); setDeleteTarget(p); }}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {(catalog.last_page ?? 1) > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-stone-100 text-xs text-stone-500">
              <span>Page {catalog.current_page} of {catalog.last_page}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 border border-stone-200 rounded-lg disabled:opacity-40 hover:bg-stone-50 transition"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(catalog.last_page, p + 1))}
                  disabled={page >= catalog.last_page}
                  className="px-3 py-1.5 border border-stone-200 rounded-lg disabled:opacity-40 hover:bg-stone-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Create Modal ── */}
      {showCreate && (
        <ProductModal title="Add New Artisan Product" onClose={() => setShowCreate(false)}>
          <ProductForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            submitLabel="Create Product"
            busy={mutating}
            serverError={mutateError}
          />
        </ProductModal>
      )}

      {/* ── Edit Modal ── */}
      {editProduct && (
        <ProductModal title="Edit Artisan Product" onClose={() => setEditProduct(null)}>
          <ProductForm
            initial={{
              name: editProduct.name,
              description: editProduct.description ?? '',
              category: editProduct.category ?? '',
              price_in_paisa: editProduct.price_in_paisa,
              stock_quantity: editProduct.stock_quantity,
              image_path: editProduct.image_path,
            }}
            onSubmit={handleUpdate}
            onCancel={() => setEditProduct(null)}
            submitLabel="Save Changes"
            busy={mutating}
            serverError={mutateError}
            isEdit
          />
        </ProductModal>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <ProductModal title="Delete Product" onClose={() => setDeleteTarget(null)}>
          <div className="space-y-4">
            <p className="text-sm text-stone-600">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-stone-900">{deleteTarget.name}</span>?
              This action cannot be undone.
            </p>
            {deleteError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {deleteError}
              </div>
            )}
            <div className="flex gap-3 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 border border-stone-300 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={mutating}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700 disabled:opacity-60 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {mutating && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </ProductModal>
      )}
    </AdminLayout>
  );
};
