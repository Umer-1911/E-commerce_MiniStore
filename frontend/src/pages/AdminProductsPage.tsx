import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Package, Pencil, Plus, Trash2, X, Upload, AlertCircle } from 'lucide-react';
import { useProductStore } from '../store/useProductStore';
import { formatPKR, resolveImageUrl } from '../services/productService';
import { ProductImage } from '../components/ProductImage';
import type { Product, ProductFormPayload } from '../types';

// ── helpers ──────────────────────────────────────────────────────────────────

const CATEGORIES = ['Clothing', 'Food & Groceries', 'Home Decor', 'Footwear', 'Handicrafts'];

const EMPTY_FORM: ProductFormPayload = {
  name: '',
  description: '',
  category: '',
  price_in_paisa: 0,
  stock_quantity: 0,
  image: null,
};

// ── ProductForm component ─────────────────────────────────────────────────────

interface ProductFormProps {
  initial?: Partial<ProductFormPayload> & { image_path?: string | null };
  onSubmit: (payload: ProductFormPayload) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  busy: boolean;
  serverError: string | null;
}

const ProductForm: React.FC<ProductFormProps> = ({ initial, onSubmit, onCancel, submitLabel, busy, serverError }) => {
  const [form, setForm] = useState<ProductFormPayload>({
    ...EMPTY_FORM,
    ...initial,
    image: null,
  });
  const [pkrDisplay, setPkrDisplay] = useState(
    initial?.price_in_paisa ? String(initial.price_in_paisa / 100) : ''
  );
  const [preview, setPreview]     = useState<string | null>(resolveImageUrl(initial?.image_path));
  const fileRef                   = useRef<HTMLInputElement>(null);
  const [errors, setErrors]       = useState<Partial<Record<keyof ProductFormPayload, string>>>({});

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (form.price_in_paisa < 0 || isNaN(form.price_in_paisa)) e.price_in_paisa = 'Price must be ≥ 0.';
    if (form.stock_quantity < 0 || isNaN(form.stock_quantity)) e.stock_quantity = 'Stock must be ≥ 0.';
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

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
        <input
          type="text"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Product name"
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
        <select
          value={form.category ?? ''}
          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">— None —</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Price (PKR) *</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">PKR</span>
          <input
            type="number"
            value={pkrDisplay}
            onChange={e => handlePriceChange(e.target.value)}
            min={0}
            step={1}
            className="w-full border border-slate-300 rounded-lg pl-12 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0"
          />
        </div>
        <p className="text-xs text-slate-400 mt-1">Stored as {form.price_in_paisa} paisa</p>
        {errors.price_in_paisa && <p className="text-xs text-red-500 mt-1">{errors.price_in_paisa}</p>}
      </div>

      {/* Stock */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity *</label>
        <input
          type="number"
          value={form.stock_quantity}
          onChange={e => setForm(f => ({ ...f, stock_quantity: Number(e.target.value) }))}
          min={0}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {errors.stock_quantity && <p className="text-xs text-red-500 mt-1">{errors.stock_quantity}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          value={form.description ?? ''}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={3}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="Product description (optional)"
        />
      </div>

      {/* Image */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Product Image</label>
        <div
          className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer hover:border-indigo-400 transition"
          onClick={() => fileRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
          ) : (
            <div className="w-16 h-16 flex items-center justify-center bg-slate-100 rounded-full">
              <Upload className="w-6 h-6 text-slate-400" />
            </div>
          )}
          <p className="text-xs text-slate-500 text-center">
            {preview ? 'Click to replace image' : 'Click to upload (JPEG, PNG, WebP — max 2 MB)'}
          </p>
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
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy}
          className="flex-1 py-2 rounded-lg bg-[#0b3b2c] text-white text-sm font-bold hover:bg-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-xs"
        >
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps { title: string; onClose: () => void; children: React.ReactNode }
const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <h2 className="font-bold text-slate-900">{title}</h2>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition">
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
);

// ── Main AdminProductsPage ─────────────────────────────────────────────────────

export const AdminProductsPage: React.FC = () => {
  const {
    catalog, catalogLoading, fetchCatalog,
    mutating, mutateError, clearMutateError,
    createProduct, updateProduct, deleteProduct,
  } = useProductStore();

  const [showCreate, setShowCreate]   = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [page, setPage]               = useState(1);

  const load = useCallback(() => {
    fetchCatalog({ per_page: 20, page, sort_by: 'created_at', sort_dir: 'desc' });
  }, [fetchCatalog, page]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (payload: ProductFormPayload) => {
    try {
      await createProduct(payload);
      // Only close the modal if the create actually succeeded
      setShowCreate(false);
      load();
    } catch {
      // Error is already stored in mutateError via the store; keep modal open
    }
  };

  const handleUpdate = async (payload: ProductFormPayload) => {
    if (!editProduct) return;
    try {
      await updateProduct(editProduct.id, payload);
      // Only close the modal if the update actually succeeded
      setEditProduct(null);
      load();
    } catch {
      // Error is already stored in mutateError via the store; keep modal open
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Could not delete product.'
        : 'Could not delete product.';
      setDeleteError(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin — Product Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            {catalog ? `${catalog.total} products in catalog` : 'Manage the product catalog.'}
          </p>
        </div>
        <button
          onClick={() => { clearMutateError(); setShowCreate(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
          New Product
        </button>
      </div>

      {/* Loading */}
      {catalogLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      )}

      {/* Table */}
      {!catalogLoading && catalog && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 w-16">Image</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Category</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Price</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Stock</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600 w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {catalog.data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No products yet. Create one above.
                    </td>
                  </tr>
                )}
                {catalog.data.map(p => {
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <div className="w-11 h-11 rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                          <ProductImage
                            imagePath={p.image_path}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            fallbackClassName="w-4 h-4 text-emerald-300"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800 max-w-[200px] truncate">{p.name}</td>
                      <td className="px-4 py-3 text-slate-500">{p.category ?? '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-indigo-700">{formatPKR(p.price_in_paisa)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={p.stock_quantity === 0 ? 'text-red-500' : 'text-slate-700'}>
                          {p.stock_quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => { clearMutateError(); setEditProduct(p); }}
                            className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 transition"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setDeleteError(null); setDeleteTarget(p); }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {catalog.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
              <span>Page {catalog.current_page} of {catalog.last_page}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-slate-50 transition"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(catalog.last_page, p + 1))}
                  disabled={page >= catalog.last_page}
                  className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-slate-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <Modal title="Create Product" onClose={() => setShowCreate(false)}>
          <ProductForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            submitLabel="Create Product"
            busy={mutating}
            serverError={mutateError}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {editProduct && (
        <Modal title="Edit Product" onClose={() => setEditProduct(null)}>
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
          />
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <Modal title="Delete Product" onClose={() => setDeleteTarget(null)}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-800">{deleteTarget.name}</span>?
              This action cannot be undone.
            </p>
            {deleteError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {deleteError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={mutating}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition flex items-center justify-center gap-2"
              >
                {mutating && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
