import { create } from 'zustand';

interface AppState {
  appName: string;
  isBackendConnected: boolean | null;
  setBackendConnected: (status: boolean) => void;
  // UI states from prototype
  isCartDrawerOpen: boolean;
  toggleCartDrawer: () => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  deliveryLocation: string;
  setDeliveryLocation: (location: string) => void;
  notification: string | null;
  showNotification: (msg: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  appName: 'MiniStore Pakistan',
  isBackendConnected: null,
  setBackendConnected: (status) => set({ isBackendConnected: status }),
  isCartDrawerOpen: false,
  toggleCartDrawer: () => set((state) => ({ isCartDrawerOpen: !state.isCartDrawerOpen })),
  openCartDrawer: () => set({ isCartDrawerOpen: true }),
  closeCartDrawer: () => set({ isCartDrawerOpen: false }),
  deliveryLocation: 'Gulberg III, Lahore, Pakistan',
  setDeliveryLocation: (location) => set({ deliveryLocation: location }),
  notification: null,
  showNotification: (msg) => {
    set({ notification: msg });
    setTimeout(() => {
      set((state) => (state.notification === msg ? { notification: null } : state));
    }, 3000);
  },
}));
