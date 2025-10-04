import { useState, useCallback } from 'react';
import { CartItem } from '@/contexts/BookingCartContext';

export interface BookingInformation {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  propertyType: string;
  specialRequirements?: string;
}

export interface DateTimeSelection {
  preferredDate: Date | null;
  preferredTime: string;
  alternativeDate?: Date;
  alternativeTime?: string;
  isFlexible: boolean;
}

export interface BookingWizardState {
  currentStep: number;
  selectedItems: CartItem[];
  bookingInfo: BookingInformation | null;
  dateTime: DateTimeSelection | null;
  couponCode: string;
  discount: number;
}

export const useBookingWizard = (initialItems: CartItem[] = []) => {
  const [state, setState] = useState<BookingWizardState>({
    currentStep: 1,
    selectedItems: initialItems,
    bookingInfo: null,
    dateTime: null,
    couponCode: '',
    discount: 0,
  });

  const addItem = useCallback((item: CartItem) => {
    setState(prev => {
      const existingIndex = prev.selectedItems.findIndex(i => i.id === item.id);
      if (existingIndex >= 0) {
        const updated = [...prev.selectedItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + item.quantity
        };
        return { ...prev, selectedItems: updated };
      }
      return { ...prev, selectedItems: [...prev.selectedItems, item] };
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setState(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.filter(item => item.id !== itemId)
    }));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setState(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    }));
  }, []);

  const setBookingInfo = useCallback((info: BookingInformation) => {
    setState(prev => ({ ...prev, bookingInfo: info }));
  }, []);

  const setDateTime = useCallback((dateTime: DateTimeSelection) => {
    setState(prev => ({ ...prev, dateTime }));
  }, []);

  const applyCoupon = useCallback((code: string, discountAmount: number) => {
    setState(prev => ({ ...prev, couponCode: code, discount: discountAmount }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: Math.min(prev.currentStep + 1, 4) }));
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: Math.max(prev.currentStep - 1, 1) }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const calculateSubtotal = useCallback(() => {
    return state.selectedItems.reduce((sum, item) => {
      if (item.pricingType === 'quote_required') return sum;
      return sum + (item.pricePerUnit * item.quantity);
    }, 0);
  }, [state.selectedItems]);

  const calculateTotal = useCallback(() => {
    const subtotal = calculateSubtotal();
    return Math.max(0, subtotal - state.discount);
  }, [calculateSubtotal, state.discount]);

  const hasQuoteItems = state.selectedItems.some(item => item.pricingType === 'quote_required');

  const canProceed = useCallback(() => {
    switch (state.currentStep) {
      case 1:
        return state.selectedItems.length > 0;
      case 2:
        return state.bookingInfo !== null && 
               state.bookingInfo.fullName !== '' &&
               state.bookingInfo.email !== '' &&
               state.bookingInfo.phone !== '';
      case 3:
        return state.dateTime !== null && state.dateTime.preferredDate !== null;
      case 4:
        return true;
      default:
        return false;
    }
  }, [state]);

  return {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    setBookingInfo,
    setDateTime,
    applyCoupon,
    nextStep,
    prevStep,
    goToStep,
    calculateSubtotal,
    calculateTotal,
    hasQuoteItems,
    canProceed,
  };
};
