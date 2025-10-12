/**
 * Shopping Cart Store
 * Phase 13: State Management Enhancement & Zustand Integration
 * 
 * Cart state for service bookings and purchases
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  serviceId: string;
  serviceName: string;
  professionalId: string;
  professionalName: string;
  price: number;
  quantity: number;
  date?: string;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  
  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItem: (id: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  
  // Computed
  getItemCount: () => number;
  hasItem: (serviceId: string) => boolean;
}

/**
 * Calculate cart total
 */
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

/**
 * Shopping cart store with persistence
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      
      addItem: (item) => set((state) => {
        // Check if item already exists
        const existingIndex = state.items.findIndex(i => 
          i.serviceId === item.serviceId && i.professionalId === item.professionalId
        );
        
        let items: CartItem[];
        if (existingIndex >= 0) {
          // Update quantity if exists
          items = state.items.map((i, index) => 
            index === existingIndex 
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
        } else {
          // Add new item
          items = [...state.items, item];
        }
        
        return { items, total: calculateTotal(items) };
      }),
      
      removeItem: (id) => set((state) => {
        const items = state.items.filter(item => item.id !== id);
        return { items, total: calculateTotal(items) };
      }),
      
      updateQuantity: (id, quantity) => set((state) => {
        if (quantity <= 0) {
          // Remove if quantity is 0
          const items = state.items.filter(item => item.id !== id);
          return { items, total: calculateTotal(items) };
        }
        
        const items = state.items.map(item =>
          item.id === id ? { ...item, quantity } : item
        );
        return { items, total: calculateTotal(items) };
      }),
      
      updateItem: (id, updates) => set((state) => {
        const items = state.items.map(item =>
          item.id === id ? { ...item, ...updates } : item
        );
        return { items, total: calculateTotal(items) };
      }),
      
      clearCart: () => set({ items: [], total: 0 }),
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
      
      hasItem: (serviceId) => {
        return get().items.some(item => item.serviceId === serviceId);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
