import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface PaymentFilters {
  status?: string;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  userId?: string;
}

interface AdvancedPaymentFiltersProps {
  filters: PaymentFilters;
  onFiltersChange: (filters: PaymentFilters) => void;
}

export const AdvancedPaymentFilters = ({ filters, onFiltersChange }: AdvancedPaymentFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof PaymentFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Advanced Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary">{activeFilterCount} active</Badge>
              )}
            </CardTitle>
            <CardDescription>Filter payments by multiple criteria</CardDescription>
          </div>
          <div className="flex gap-2">
            {activeFilterCount > 0 && (
              <Button onClick={clearFilters} variant="ghost" size="sm">
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="outline"
              size="sm"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status || ''} onValueChange={(v) => updateFilter('status', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="succeeded">Succeeded</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Currency Filter */}
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={filters.currency || ''} onValueChange={(v) => updateFilter('currency', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All currencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All currencies</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Input
                placeholder="e.g., card, bank_transfer"
                value={filters.paymentMethod || ''}
                onChange={(e) => updateFilter('paymentMethod', e.target.value)}
              />
            </div>

            {/* Min Amount */}
            <div className="space-y-2">
              <Label>Min Amount</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={filters.minAmount || ''}
                onChange={(e) => updateFilter('minAmount', parseFloat(e.target.value) || undefined)}
              />
            </div>

            {/* Max Amount */}
            <div className="space-y-2">
              <Label>Max Amount</Label>
              <Input
                type="number"
                placeholder="10000.00"
                value={filters.maxAmount || ''}
                onChange={(e) => updateFilter('maxAmount', parseFloat(e.target.value) || undefined)}
              />
            </div>

            {/* User ID */}
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input
                placeholder="Filter by user..."
                value={filters.userId || ''}
                onChange={(e) => updateFilter('userId', e.target.value)}
              />
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => updateFilter('startDate', e.target.value)}
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => updateFilter('endDate', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
