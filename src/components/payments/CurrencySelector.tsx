import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';

interface CurrencySelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
}

export function CurrencySelector({
  value,
  onChange,
  label = "Currency",
  disabled = false,
}: CurrencySelectorProps) {
  const { supportedCurrencies } = useCurrencyConverter();

  return (
    <div className="space-y-2">
      <Label htmlFor="currency">{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="currency">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {supportedCurrencies.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              {currency.symbol} {currency.name} ({currency.code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
