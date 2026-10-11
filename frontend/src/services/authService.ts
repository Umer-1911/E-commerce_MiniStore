import api, { getCsrfCookie } from './api';
import type {
  AdminTestResponse,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from '../types';

export const authService = {
  /**
   * Register a new customer account
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    await getCsrfCookie();
    const response = await api.post<AuthResponse>('/register', payload);
    return response.data;
  },

  /**
   * Log in with email and password
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    await getCsrfCookie();
    const response = await api.post<AuthResponse>('/login', payload);
    return response.data;
  },

  /**
   * Log out currently authenticated user
   */
  async logout(): Promise<{ message: string }> {
    try {
      await getCsrfCookie();
    } catch {
      // Continue if csrf-cookie endpoint cannot be reached
    }
    const response = await api.post<{ message: string }>('/logout');
    return response.data;
  },

  /**
   * Retrieve currently authenticated user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ user: User }>('/user');
    return response.data.user;
  },

  /**
   * Test admin authorization endpoint
   */
  async testAdminAccess(): Promise<AdminTestResponse> {
    const response = await api.get<AdminTestResponse>('/admin/test');
    return response.data;
  },
};
