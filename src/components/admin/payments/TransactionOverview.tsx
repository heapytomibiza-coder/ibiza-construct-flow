import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery } from '@tanstack/react-query';
import { useAdminPayments } from '@/hooks/admin/useAdminPayments';
import { format } from 'date-fns';

interface TransactionOverviewProps {
  filters?: any;
  onSelectionChange?: (ids: string[]) => void;
  refreshKey?: number;
}

export function TransactionOverview({ 
  filters: externalFilters, 
  onSelectionChange,
  refreshKey = 0 
}: TransactionOverviewProps = {}) {
  const { fetchTransactions } = useAdminPayments();
  const [localFilters, setLocalFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filters = externalFilters || localFilters;

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['admin-transactions', filters, refreshKey],
    queryFn: () => fetchTransactions(filters),
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked && transactions) {
      const ids = transactions.map((t: any) => t.id);
      setSelectedIds(ids);
      onSelectionChange?.(ids);
    } else {
      setSelectedIds([]);
      onSelectionChange?.([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    let newSelection: string[];
    if (checked) {
      newSelection = [...selectedIds, id];
    } else {
      newSelection = selectedIds.filter(sid => sid !== id);
    }
    setSelectedIds(newSelection);
    onSelectionChange?.(newSelection);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'succeeded':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      case 'cancelled':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Overview</CardTitle>
        <CardDescription>View and filter all payment transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {!externalFilters && (
              <>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={localFilters.status}
                    onValueChange={(value) => setLocalFilters({ ...localFilters, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="succeeded">Succeeded</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={localFilters.startDate}
                    onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={localFilters.endDate}
                    onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>

          {/* Transactions Table */}
          {isLoading ? (
            <div className="text-center py-8">Loading transactions...</div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    {onSelectionChange && (
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedIds.length === transactions?.length && transactions?.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                    )}
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction: any) => (
                    <TableRow key={transaction.id}>
                      {onSelectionChange && (
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(transaction.id)}
                            onCheckedChange={(checked) => handleSelectOne(transaction.id, checked as boolean)}
                          />
                        </TableCell>
                      )}
                      <TableCell className="text-sm">
                        {format(new Date(transaction.created_at), 'PP')}
                      </TableCell>
                      <TableCell>
                        {transaction.profiles?.display_name || transaction.profiles?.full_name}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${transaction.amount} {transaction.currency}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {transaction.payment_method || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
