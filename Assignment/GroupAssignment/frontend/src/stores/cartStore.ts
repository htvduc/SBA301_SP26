import { create } from 'zustand';
import type { CartItem } from '@/types/dto';

interface CartState {
  items: CartItem[];
  selectedTableId: string | null;
  selectedTableName: string | null;

  setSelectedTable: (tableId: string | null, tableName: string | null) => void;
  addItem: (item: CartItem) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateNote: (cartItemId: string, note: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  selectedTableId: null,
  selectedTableName: null,

  setSelectedTable: (tableId, tableName) => set({ selectedTableId: tableId, selectedTableName: tableName }),

  addItem: (item) => {
    const { items } = get();
    const existingIndex = items.findIndex(
      (i) =>
        i.menuItemId === item.menuItemId &&
        i.note === item.note &&
        JSON.stringify(i.customizations) === JSON.stringify(item.customizations)
    );

    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + item.quantity,
        totalPrice: recalcItemTotal({
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + item.quantity,
        }),
      };
      set({ items: updated });
    } else {
      set({ items: [...items, item] });
    }
  },

  removeItem: (cartItemId) => {
    set({ items: get().items.filter((i) => i.cartItemId !== cartItemId) });
  },

  updateQuantity: (cartItemId, quantity) => {
    if (quantity <= 0) {
      set({ items: get().items.filter((i) => i.cartItemId !== cartItemId) });
      return;
    }
    set({
      items: get().items.map((i) =>
        i.cartItemId === cartItemId
          ? { ...i, quantity, totalPrice: recalcItemTotal({ ...i, quantity }) }
          : i
      ),
    });
  },

  updateNote: (cartItemId, note) => {
    set({
      items: get().items.map((i) => (i.cartItemId === cartItemId ? { ...i, note } : i)),
    });
  },

  clearCart: () => set({ items: [], selectedTableId: null, selectedTableName: null }),

  getTotal: () => get().items.reduce((sum, i) => sum + i.totalPrice, 0),

  getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));

function recalcItemTotal(item: CartItem): number {
  const custTotal = item.customizations.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const effectiveUnitPrice = item.discountedPrice ?? item.price;
  return (effectiveUnitPrice + custTotal) * item.quantity;
}
