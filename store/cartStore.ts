import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

interface CartStore {
  items: CartItem[];
  selectedShippingMethodId: string | null;
  addItem: (product: Product, size: string, color: string, quantity?: number) => { success: boolean; message?: string; availableStock?: number };
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => { success: boolean; message?: string; availableStock?: number };
  setSelectedShippingMethod: (methodId: string | null) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

// Custom storage that handles SSR
const storage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(name, value);
    } catch {
      // Ignore errors
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(name);
    } catch {
      // Ignore errors
    }
  },
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      selectedShippingMethodId: null,
  
  addItem: (product, size, color, quantity = 1) => {
    const items = get().items;
    const existingItem = items.find(
      item => item.product.id === product.id && item.size === size && item.color === color
    );
    
    // Get available stock
    const availableStock = (product as any).quantity || (product as any).stock || 0;
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const requestedQuantity = currentQuantity + quantity;
    
    // Check stock availability
    if (requestedQuantity > availableStock) {
      return {
        success: false,
        message: `В наличии только ${availableStock} шт.`,
        availableStock
      };
    }
    
    if (existingItem) {
      set({
        items: items.map(item =>
          item.product.id === product.id && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      });
    } else {
      set({
        items: [...items, { product, size, color, quantity }],
      });
    }
    
    return { success: true };
  },
  
  removeItem: (productId, size, color) => {
    set({
      items: get().items.filter(
        item => !(item.product.id === productId && item.size === size && item.color === color)
      ),
    });
  },
  
  updateQuantity: (productId, size, color, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId, size, color);
      return { success: true };
    }
    
    const items = get().items;
    const item = items.find(
      item => item.product.id === productId && item.size === size && item.color === color
    );
    
    if (!item) {
      return { success: false, message: 'Товар не найден в корзине' };
    }
    
    // Get available stock
    const availableStock = (item.product as any).quantity || (item.product as any).stock || 0;
    
    // Check stock availability
    if (quantity > availableStock) {
      return {
        success: false,
        message: `В наличии только ${availableStock} шт.`,
        availableStock
      };
    }
    
    set({
      items: items.map(item =>
        item.product.id === productId && item.size === size && item.color === color
          ? { ...item, quantity }
          : item
      ),
    });
    
    return { success: true };
  },
  
  setSelectedShippingMethod: (methodId) => set({ selectedShippingMethodId: methodId }),
  clearCart: () => set({ items: [], selectedShippingMethodId: null }),
  
  getTotal: () => {
    return get().items.reduce((total, item) => {
      const price = item.product.discount 
        ? item.product.price * (1 - item.product.discount / 100)
        : item.product.price;
      return total + price * item.quantity;
    }, 0);
  },
  
  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => storage),
      skipHydration: true,
    }
  )
);

