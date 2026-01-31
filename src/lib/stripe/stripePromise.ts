/**
 * Centralized Stripe Promise Provider
 * 
 * This module provides lazy loading of Stripe to avoid initialization errors
 * when VITE_STRIPE_PUBLISHABLE_KEY is not configured.
 * 
 * IMPORTANT: Never call loadStripe at module level in components.
 * Always use getStripePromise() which handles missing keys gracefully.
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get the Stripe promise lazily.
 * Returns null if Stripe publishable key is not configured.
 * Safe to call multiple times - will reuse the same promise.
 */
export function getStripePromise(): Promise<Stripe | null> {
  if (stripePromise) {
    return stripePromise;
  }

  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    console.warn('[Stripe] VITE_STRIPE_PUBLISHABLE_KEY not configured - payment features disabled');
    stripePromise = Promise.resolve(null);
    return stripePromise;
  }

  stripePromise = loadStripe(publishableKey);
  return stripePromise;
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
}
