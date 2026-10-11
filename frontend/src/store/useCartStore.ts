import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: number;
  name: string;
  price_in_paisa: number;   // integer paisa — never floats
  image_path: string | null;
  quantity: number;
  availableStock: number;   // client-side UX limit only — NOT trusted for ordering
}

interface CartState {
  items: CartItem[];

  // Mutations
  addToCart: (product: Omit<CartItem, 'quantity'>, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;

  // Derived (computed as functions for reactivity)
  getTotalItems: () => number;
  getSubtotal: () => number;          // integer paisa
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product, quantity) => {
        if (quantity < 1) return;

        set(state => {
          const existing = state.items.find(i => i.productId === product.productId);

          if (existing) {
            // Merge: cap at available stock
            const newQty = Math.min(
              existing.quantity + quantity,
              product.availableStock
            );
            return {
              items: state.items.map(i =>
                i.productId === product.productId
                  ? { ...i, quantity: newQty }
                  : i
              ),
            };
          }

          // New item: cap at available stock
          const cappedQty = Math.min(quantity, product.availableStock);
          return {
            items: [
              ...state.items,
              { ...product, quantity: cappedQty },
            ],
          };
        });
      },

      removeFromCart: (productId) => {
        set(state => ({
          items: state.items.filter(i => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          // Treat 0 or negative as a remove
          set(state => ({
            items: state.items.filter(i => i.productId !== productId),
          }));
          return;
        }

        set(state => ({
          items: state.items.map(i => {
            if (i.productId !== productId) return i;
            const capped = Math.min(quantity, i.availableStock);
            return { ...i, quantity: capped };
          }),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      // Returns integer paisa — no floating point
      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price_in_paisa * i.quantity, 0),
    }),
    {
      name: 'ministore-cart',          // localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);
