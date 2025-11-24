import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  professionalId: string;
  professionalName: string;
  serviceName: string;
  quantity: number;
  pricePerUnit: number;
  pricingType: 'fixed' | 'per_hour' | 'per_unit' | 'per_square_meter' | 'per_project' | 'range' | 'quote_required';
  unitType?: string;
  imageUrl?: string;
}

interface BookingCartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  hasQuoteItems: boolean;
}

const BookingCartContext = createContext<BookingCartContextType | undefined>(undefined);

export const BookingCartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Persist cart in localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('bookingCart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to load cart from storage', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bookingCart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(i => i.id === item.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + item.quantity
        };
        return updated;
      }
      return [...prev, item];
    });
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const totalPrice = items.reduce((sum, item) => {
    if (item.pricingType === 'quote_required') return sum;
    return sum + (item.pricePerUnit * item.quantity);
  }, 0);

  const hasQuoteItems = items.some(item => item.pricingType === 'quote_required');

  return (
    <BookingCartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        hasQuoteItems,
      }}
    >
      {children}
    </BookingCartContext.Provider>
  );
};

export const useBookingCart = () => {
  const context = useContext(BookingCartContext);
  if (!context) {
    throw new Error('useBookingCart must be used within BookingCartProvider');
  }
  return context;
};
