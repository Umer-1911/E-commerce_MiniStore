import api, { getBackendRootUrl } from './api';
import type { PaginatedProducts, Product, ProductFilters, ProductFormPayload } from '../types';

/**
 * Resolve the public storage URL for a product image path.
 * Handles paths like "products/<uuid>.jpg", "/storage/products/<uuid>.jpg", or external URLs.
 */
export function resolveImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;
  // If already absolute URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const root = getBackendRootUrl();
  const cleanPath = imagePath.replace(/^\/+/, '').replace(/^storage\/+/, '');
  return `${root}/storage/${cleanPath}`;
}

/**
 * Format price_in_paisa (integer) to a human-readable PKR string.
 * e.g. 385000 → "PKR 3,850"
 */
export function formatPKR(paisa: number): string {
  const pkr = paisa / 100;
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(pkr);
}

export const productService = {
  /** Fetch paginated, filterable product list. */
  async list(filters: ProductFilters = {}): Promise<PaginatedProducts> {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.sort_by) params.set('sort_by', filters.sort_by);
    if (filters.sort_dir) params.set('sort_dir', filters.sort_dir);
    if (filters.per_page) params.set('per_page', String(filters.per_page));
    if (filters.page) params.set('page', String(filters.page));

    const response = await api.get<PaginatedProducts>(`/products?${params.toString()}`);
    return response.data;
  },

  /** Fetch a single product by ID. */
  async get(id: number): Promise<Product> {
    const response = await api.get<{ data: Product }>(`/products/${id}`);
    return response.data.data;
  },

  /** Create a product (admin only). FormData is automatically handled with correct multipart boundary. */
  async create(payload: ProductFormPayload): Promise<Product> {
    const response = await api.post<{ data: Product }>('/admin/products', buildFormData(payload));
    return response.data.data;
  },

  /** Update a product (admin only). Uses POST + _method=PUT for multipart support. */
  async update(id: number, payload: Partial<ProductFormPayload>): Promise<Product> {
    const fd = buildFormData(payload);
    fd.append('_method', 'PUT');
    const response = await api.post<{ data: Product }>(`/admin/products/${id}`, fd);
    return response.data.data;
  },

  /** Delete a product (admin only). */
  async remove(id: number): Promise<void> {
    await api.delete(`/admin/products/${id}`);
  },
};

function buildFormData(payload: Partial<ProductFormPayload>): FormData {
  const fd = new FormData();
  if (payload.name !== undefined) fd.append('name', payload.name);
  if (payload.description !== undefined) fd.append('description', payload.description ?? '');
  if (payload.category !== undefined) fd.append('category', payload.category ?? '');
  if (payload.price_in_paisa !== undefined) fd.append('price_in_paisa', String(payload.price_in_paisa));
  if (payload.stock_quantity !== undefined) fd.append('stock_quantity', String(payload.stock_quantity));
  if (payload.image instanceof File) {
    fd.append('image', payload.image);
    console.debug('[productService] image appended to FormData:', payload.image.name, payload.image.size + 'B', payload.image.type);
  } else {
    console.debug('[productService] no image in payload. payload.image =', payload.image);
  }
  return fd;
}
