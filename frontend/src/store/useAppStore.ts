import { create } from 'zustand';

interface AppState {
  appName: string;
  isBackendConnected: boolean | null;
  setBackendConnected: (status: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  appName: 'E-Commerce Mini-Store',
  isBackendConnected: null,
  setBackendConnected: (status) => set({ isBackendConnected: status }),
}));
