import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/types';

interface FavoritesStore {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  toggleItem: (product: Product) => void;
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

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => {
        if (!get().isFavorite(product.id)) {
          set({ items: [...get().items, product] });
        }
      },
      
      removeItem: (productId) => {
        set({ items: get().items.filter(item => item.id !== productId) });
      },
      
      isFavorite: (productId) => {
        return get().items.some(item => item.id === productId);
      },
      
      toggleItem: (product) => {
        if (get().isFavorite(product.id)) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => storage),
      skipHydration: true,
    }
  )
);
