import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface ConvertedAmountProps {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  showOriginal?: boolean;
  className?: string;
}

export function ConvertedAmount({
  amount,
  fromCurrency,
  toCurrency,
  showOriginal = true,
  className = '',
}: ConvertedAmountProps) {
  const { convertAmount, formatCurrency, getExchangeRate } = useCurrencyConverter();

  if (fromCurrency === toCurrency) {
    return <span className={className}>{formatCurrency(amount, fromCurrency)}</span>;
  }

  const convertedAmount = convertAmount(amount, fromCurrency, toCurrency);
  const rate = getExchangeRate(fromCurrency, toCurrency);

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center gap-2">
        {showOriginal && (
          <>
            <span className="text-muted-foreground">
              {formatCurrency(amount, fromCurrency)}
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
          </>
        )}
        <span className="font-semibold">{formatCurrency(convertedAmount, toCurrency)}</span>
      </div>
      <div className="text-xs text-muted-foreground">
        Rate: 1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
      </div>
    </div>
  );
}
