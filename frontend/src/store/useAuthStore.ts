import { create } from 'zustand';
import { authService } from '../services/authService';
import type { LoginPayload, RegisterPayload, User } from '../types';
import axios from 'axios';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialCheckDone: boolean;
  error: string | null;

  register: (payload: RegisterPayload) => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  clearError: () => void;
}

function parseErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.response?.data?.errors) {
      // First validation error message
      const firstKey = Object.keys(err.response.data.errors)[0];
      if (firstKey && err.response.data.errors[firstKey].length > 0) {
        return err.response.data.errors[firstKey][0];
      }
    }
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    if (err.response?.status === 403) {
      return 'Access forbidden. Admin privileges required.';
    }
    if (err.response?.status === 401) {
      return 'Unauthenticated. Please log in.';
    }
  }
  return err instanceof Error ? err.message : 'An unexpected error occurred';
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  initialCheckDone: false,
  error: null,

  clearError: () => set({ error: null }),

  register: async (payload: RegisterPayload) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.register(payload);
      set({
        user: data.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (err: unknown) {
      set({
        error: parseErrorMessage(err),
        loading: false,
      });
      throw err;
    }
  },

  login: async (payload: LoginPayload) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.login(payload);
      set({
        user: data.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (err: unknown) {
      set({
        error: parseErrorMessage(err),
        loading: false,
      });
      throw err;
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await authService.logout();
    } catch {
      // Continue clearing client state even if network call failed
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    }
  },

  fetchCurrentUser: async () => {
    set({ loading: true });
    try {
      const user = await authService.getCurrentUser();
      set({
        user,
        isAuthenticated: true,
        loading: false,
        initialCheckDone: true,
        error: null,
      });
    } catch {
      // If 401 or failed, user is not authenticated on backend
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        initialCheckDone: true,
        error: null,
      });
    }
  },
}));
