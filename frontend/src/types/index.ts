export interface HealthResponse {
  status: string;
}

export type UserRole = 'customer' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  marketing_consent?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AdminTestResponse {
  message: string;
}

// ─── Product ───────────────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  price_in_paisa: number;
  image_path: string | null;
  stock_quantity: number;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedProducts {
  data: Product[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  sort_by?: 'name' | 'price_in_paisa' | 'stock_quantity' | 'created_at';
  sort_dir?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface ProductFormPayload {
  name: string;
  description?: string;
  category?: string;
  price_in_paisa: number;
  stock_quantity: number;
  image?: File | null;
}

// ─── Order ─────────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price_at_purchase_in_paisa: number;
  product?: Product;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: number;
  user_id: number;
  total_amount_in_paisa: number;
  status: OrderStatus;
  order_items?: OrderItem[];
  user?: User;
  created_at?: string;
  updated_at?: string;
}

export interface CreateOrderPayload {
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}

export interface CreateOrderResponse {
  message: string;
  data: Order;
}

