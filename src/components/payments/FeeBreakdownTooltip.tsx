import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { formatCurrency } from '@/lib/ibiza-defaults';

interface FeeBreakdownTooltipProps {
  fees: {
    platformFee: number;
    processingFee: number;
    total: number;
  };
}

export const FeeBreakdownTooltip = ({ fees }: FeeBreakdownTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-auto p-1">
            <Info className="w-4 h-4 text-muted-foreground" />
            <span className="ml-1 text-xs">Fees</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="w-64 p-4">
          <div className="space-y-3">
            <p className="font-semibold text-sm">Fee Breakdown</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee</span>
                <span className="font-medium">{formatCurrency(fees.platformFee)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Processing Fee</span>
                <span className="font-medium">{formatCurrency(fees.processingFee)}</span>
              </div>
              
              <div className="flex justify-between pt-2 border-t font-semibold">
                <span>Total Fees</span>
                <span>{formatCurrency(fees.total)}</span>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">
              All fees are clearly disclosed upfront. No hidden charges.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
