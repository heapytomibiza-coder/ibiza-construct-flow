import { useState } from 'react';
import { CreditCard, Wallet, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PaymentMethod {
  id: string;
  name: string;
  icon: any;
  description: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: CreditCard,
    description: 'Pay securely with your card',
  },
  {
    id: 'sepa',
    name: 'SEPA Direct Debit',
    icon: Building2,
    description: 'Direct debit from your bank account',
  },
  {
    id: 'wallet',
    name: 'Digital Wallet',
    icon: Wallet,
    description: 'Apple Pay, Google Pay',
  },
];

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
}

export function PaymentMethodSelector({ 
  selectedMethod, 
  onMethodChange 
}: PaymentMethodSelectorProps) {
  return (
    <RadioGroup value={selectedMethod} onValueChange={onMethodChange}>
      <div className="space-y-3">
        {PAYMENT_METHODS.map((method) => (
          <Card 
            key={method.id}
            className={`cursor-pointer transition-colors ${
              selectedMethod === method.id 
                ? 'border-primary ring-2 ring-primary/20' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => onMethodChange(method.id)}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <RadioGroupItem value={method.id} id={method.id} />
              <method.icon className="h-6 w-6 text-muted-foreground" />
              <div className="flex-1">
                <Label 
                  htmlFor={method.id} 
                  className="font-medium cursor-pointer"
                >
                  {method.name}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {method.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </RadioGroup>
  );
}
