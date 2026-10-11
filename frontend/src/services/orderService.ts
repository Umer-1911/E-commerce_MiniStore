import api from './api';
import type { CreateOrderPayload, CreateOrderResponse, Order, OrderStatus } from '../types';

export const orderService = {
  /**
   * Create a new order with only product_id and quantity (never client-side prices or totals).
   * Authenticated customers only.
   */
  async createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
    const response = await api.post<CreateOrderResponse>('/orders', payload);
    return response.data;
  },

  /**
   * Fetch all orders for the currently authenticated customer.
   */
  async listOrders(): Promise<Order[]> {
    const response = await api.get<{ data: Order[] }>('/orders');
    return response.data.data;
  },

  /**
   * Fetch a single order by ID for the currently authenticated customer.
   */
  async getOrder(id: number): Promise<Order> {
    const response = await api.get<{ data: Order }>(`/orders/${id}`);
    return response.data.data;
  },

  /**
   * Fetch all orders across all customers (admin only).
   */
  async listAdminOrders(): Promise<Order[]> {
    const response = await api.get<{ data: Order[] }>('/admin/orders');
    return response.data.data;
  },

  /**
   * Fetch a single order with customer and item details (admin only).
   */
  async getAdminOrder(id: number): Promise<Order> {
    const response = await api.get<{ data: Order }>(`/admin/orders/${id}`);
    return response.data.data;
  },

  /**
   * Update the status of an order (admin only).
   */
  async updateAdminOrderStatus(id: number, status: OrderStatus): Promise<{ message: string; data: Order }> {
    const response = await api.patch<{ message: string; data: Order }>(`/admin/orders/${id}/status`, {
      status,
    });
    return response.data;
  },
};
