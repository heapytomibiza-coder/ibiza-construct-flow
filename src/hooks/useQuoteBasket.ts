import { useEffect, useMemo, useState } from 'react';
import type { PricingType } from '@/types/services';

export interface BasketItem {
  id: string;
  serviceItemId: string;
  name: string;
  pricePerUnit: number;
  pricingType: PricingType;
  unitLabel: string;
  quantity: number;
  subtotal: number;
}

export interface BasketState {
  items: BasketItem[];
  notes: string;
}

const STORAGE_KEY_PREFIX = 'quote-basket';

function loadFromStorage(key: string): BasketState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as BasketState) : null;
  } catch (error) {
    console.warn('useQuoteBasket: failed to load basket state', error);
    return null;
  }
}

function saveToStorage(key: string, state: BasketState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.warn('useQuoteBasket: failed to persist basket state', error);
  }
}

function generateLineId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `basket-${Math.random().toString(36).slice(2, 10)}`;
}

export function useQuoteBasket(storageKeySuffix: string) {
  const storageKey = `${STORAGE_KEY_PREFIX}-${storageKeySuffix}`;

  const [items, setItems] = useState<BasketItem[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const stored = loadFromStorage(storageKey);
    if (stored) {
      setItems(stored.items || []);
      setNotes(stored.notes || '');
    }
  }, [storageKey]);

  useEffect(() => {
    saveToStorage(storageKey, { items, notes });
  }, [items, notes, storageKey]);

  const totalEstimate = useMemo(
    () => items.reduce((sum, item) => sum + item.subtotal, 0),
    [items]
  );

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  function addItem(
    base: Omit<BasketItem, 'id' | 'subtotal' | 'quantity'>,
    quantity = 1
  ) {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.serviceItemId === base.serviceItemId
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQuantity = existing.quantity + quantity;
        updated[existingIndex] = {
          ...existing,
          quantity: newQuantity,
          subtotal: newQuantity * existing.pricePerUnit,
        };
        return updated;
      }

      const newItem: BasketItem = {
        ...base,
        id: generateLineId(),
        quantity,
        subtotal: quantity * base.pricePerUnit,
      };

      return [...prev, newItem];
    });
  }

  function updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, quantity, subtotal: quantity * item.pricePerUnit }
          : item
      )
    );
  }

  function removeItem(itemId: string) {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }

  function clearBasket() {
    setItems([]);
    setNotes('');
  }

  return {
    items,
    notes,
    setNotes,
    totalItems,
    totalEstimate,
    addItem,
    updateQuantity,
    removeItem,
    clearBasket,
  };
}
