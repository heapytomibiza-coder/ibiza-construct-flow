import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Download, Filter, Search, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const TransactionHistory = () => {
  const { user } = useAuth();
  const { transactions, loading, filter, setFilter, exportTransactions, getTransactionById } = useTransactionHistory(user?.id);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'pending': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'failed': return 'bg-red-500/10 text-red-700 dark:text-red-400';
      case 'cancelled': return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment':
      case 'fee':
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'refund':
      case 'payout':
        return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleViewDetails = async (transactionId: string) => {
    const transaction = await getTransactionById(transactionId);
    if (transaction) {
      setSelectedTransaction(transaction);
      setDetailsOpen(true);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (!searchQuery) return true;
    return (
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.stripe_transaction_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Loading transactions...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View and manage all your payment transactions</CardDescription>
            </div>
            <Button onClick={exportTransactions} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={filter.type || 'all'}
              onValueChange={(value) => setFilter({ ...filter, type: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
                <SelectItem value="payout">Payout</SelectItem>
                <SelectItem value="fee">Fee</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filter.status || 'all'}
              onValueChange={(value) => setFilter({ ...filter, status: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions List */}
          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleViewDetails(transaction.id)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 bg-muted rounded-lg">
                      {getTypeIcon(transaction.transaction_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium capitalize truncate">
                          {transaction.description || transaction.transaction_type}
                        </p>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.created_at), 'MMM dd, yyyy • HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.transaction_type === 'refund' || transaction.transaction_type === 'payout'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.transaction_type === 'refund' || transaction.transaction_type === 'payout' ? '+' : '-'}
                      {transaction.currency} {transaction.amount.toFixed(2)}
                    </p>
                    {transaction.payment_method && (
                      <p className="text-sm text-muted-foreground capitalize">
                        {transaction.payment_method}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Complete information about this transaction
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Type</p>
                  <p className="font-medium capitalize">{selectedTransaction.transaction_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge className={getStatusColor(selectedTransaction.status)}>
                    {selectedTransaction.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Amount</p>
                  <p className="font-semibold">
                    {selectedTransaction.currency} {selectedTransaction.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date</p>
                  <p className="font-medium">
                    {format(new Date(selectedTransaction.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                {selectedTransaction.payment_method && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                    <p className="font-medium capitalize">{selectedTransaction.payment_method}</p>
                  </div>
                )}
                {selectedTransaction.stripe_transaction_id && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
                    <p className="font-mono text-xs break-all">{selectedTransaction.stripe_transaction_id}</p>
                  </div>
                )}
              </div>
              {selectedTransaction.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{selectedTransaction.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
