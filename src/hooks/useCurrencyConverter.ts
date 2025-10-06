import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const SUPPORTED_CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

export function useCurrencyConverter() {
  const { data: exchangeRates, isLoading } = useQuery({
    queryKey: ['exchange-rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const getExchangeRate = (fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return 1;

    // Try direct rate
    const directRate = exchangeRates?.find(
      (rate) => rate.from_currency === fromCurrency && rate.to_currency === toCurrency
    );
    if (directRate) return Number(directRate.rate);

    // Try inverse rate
    const inverseRate = exchangeRates?.find(
      (rate) => rate.from_currency === toCurrency && rate.to_currency === fromCurrency
    );
    if (inverseRate) return 1 / Number(inverseRate.rate);

    return 1; // Fallback
  };

  const convertAmount = (
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): number => {
    const rate = getExchangeRate(fromCurrency, toCurrency);
    return Math.round(amount * rate * 100) / 100;
  };

  const formatCurrency = (
    amount: number,
    currencyCode: string,
    options?: { showCode?: boolean }
  ): string => {
    const currency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);
    const symbol = currency?.symbol || currencyCode;
    const formatted = amount.toFixed(2);

    if (options?.showCode) {
      return `${symbol}${formatted} ${currencyCode}`;
    }
    return `${symbol}${formatted}`;
  };

  const getCurrencySymbol = (currencyCode: string): string => {
    return SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode)?.symbol || currencyCode;
  };

  return {
    exchangeRates,
    isLoading,
    getExchangeRate,
    convertAmount,
    formatCurrency,
    getCurrencySymbol,
    supportedCurrencies: SUPPORTED_CURRENCIES,
  };
}
