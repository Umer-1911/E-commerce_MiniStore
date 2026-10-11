import { create } from 'zustand';
import { productService } from '../services/productService';
import type { PaginatedProducts, Product, ProductFilters, ProductFormPayload } from '../types';

interface ProductState {
  // Catalog state
  catalog: PaginatedProducts | null;
  catalogLoading: boolean;
  catalogError: string | null;
  filters: ProductFilters;

  // Detail state
  detail: Product | null;
  detailLoading: boolean;
  detailError: string | null;

  // Admin mutation state
  mutating: boolean;
  mutateError: string | null;

  // Actions
  fetchCatalog: (filters?: ProductFilters) => Promise<void>;
  setFilters: (filters: ProductFilters) => void;
  fetchProduct: (id: number) => Promise<void>;
  createProduct: (payload: ProductFormPayload) => Promise<Product>;
  updateProduct: (id: number, payload: Partial<ProductFormPayload>) => Promise<Product>;
  deleteProduct: (id: number) => Promise<void>;
  clearMutateError: () => void;
}

function parseError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }).response;
    if (response?.data?.errors) {
      const firstKey = Object.keys(response.data.errors)[0];
      if (firstKey) return response.data.errors[firstKey][0];
    }
    if (response?.data?.message) return response.data.message;
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred';
}

export const useProductStore = create<ProductState>((set, get) => ({
  catalog: null,
  catalogLoading: false,
  catalogError: null,
  filters: { per_page: 12, sort_by: 'created_at', sort_dir: 'desc' },

  detail: null,
  detailLoading: false,
  detailError: null,

  mutating: false,
  mutateError: null,

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  fetchCatalog: async (overrideFilters?: ProductFilters) => {
    const filters = overrideFilters ?? get().filters;
    set({ catalogLoading: true, catalogError: null });
    try {
      const catalog = await productService.list(filters);
      set({ catalog, catalogLoading: false, filters });
    } catch (err) {
      set({ catalogLoading: false, catalogError: parseError(err) });
    }
  },

  fetchProduct: async (id: number) => {
    set({ detailLoading: true, detailError: null, detail: null });
    try {
      const detail = await productService.get(id);
      set({ detail, detailLoading: false });
    } catch (err) {
      set({ detailLoading: false, detailError: parseError(err) });
    }
  },

  createProduct: async (payload: ProductFormPayload) => {
    set({ mutating: true, mutateError: null });
    try {
      const product = await productService.create(payload);
      set({ mutating: false });
      return product;
    } catch (err) {
      set({ mutating: false, mutateError: parseError(err) });
      throw err;
    }
  },

  updateProduct: async (id: number, payload: Partial<ProductFormPayload>) => {
    set({ mutating: true, mutateError: null });
    try {
      const product = await productService.update(id, payload);
      set({ mutating: false });
      return product;
    } catch (err) {
      set({ mutating: false, mutateError: parseError(err) });
      throw err;
    }
  },

  deleteProduct: async (id: number) => {
    set({ mutating: true, mutateError: null });
    try {
      await productService.remove(id);
      set({ mutating: false });
    } catch (err) {
      set({ mutating: false, mutateError: parseError(err) });
      throw err;
    }
  },

  clearMutateError: () => set({ mutateError: null }),
}));
