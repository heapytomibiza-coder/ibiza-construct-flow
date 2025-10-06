import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, AlertTriangle, UserX, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DisputeCategory = 'payment' | 'quality' | 'conduct' | 'timeline';

interface DisputeType {
  key: DisputeCategory;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  suggestedEvidence: string[];
}

const DISPUTE_TYPES: DisputeType[] = [
  {
    key: 'payment',
    label: 'Payment Issue',
    description: 'Non-payment, late payment, or incorrect amount',
    icon: DollarSign,
    suggestedEvidence: ['contracts', 'invoices', 'messages'],
  },
  {
    key: 'quality',
    label: 'Quality Concern',
    description: 'Workmanship, incomplete work, or materials',
    icon: AlertTriangle,
    suggestedEvidence: ['photos', 'work_logs', 'receipts'],
  },
  {
    key: 'conduct',
    label: 'Professional Conduct',
    description: 'Behavior, communication, or safety concerns',
    icon: UserX,
    suggestedEvidence: ['messages', 'photos', 'documents'],
  },
  {
    key: 'timeline',
    label: 'Timeline Issue',
    description: 'Delays, cancellations, or no-shows',
    icon: Clock,
    suggestedEvidence: ['contracts', 'messages', 'work_logs'],
  },
];

interface DisputeTypeSelectorProps {
  value?: DisputeCategory | null;
  onChange: (type: DisputeCategory, suggestedEvidence: string[]) => void;
}

export function DisputeTypeSelector({ value, onChange }: DisputeTypeSelectorProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">What best describes the issue?</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {DISPUTE_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = value === type.key;
          
          return (
            <Button
              key={type.key}
              type="button"
              variant={isSelected ? 'default' : 'outline'}
              className={cn(
                'justify-start h-auto py-4 px-4 text-left transition-all',
                isSelected && 'ring-2 ring-primary ring-offset-2'
              )}
              onClick={() => onChange(type.key, type.suggestedEvidence)}
            >
              <div className="flex items-start gap-3 w-full">
                <Icon className={cn(
                  'h-5 w-5 mt-0.5 flex-shrink-0',
                  isSelected ? 'text-primary-foreground' : 'text-muted-foreground'
                )} />
                <div className="flex-1">
                  <div className="font-medium">{type.label}</div>
                  <div className={cn(
                    'text-sm mt-1',
                    isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  )}>
                    {type.description}
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
