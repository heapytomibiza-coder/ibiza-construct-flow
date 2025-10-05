import React, { useState } from 'react';
import { usePayments } from '@/hooks/usePayments';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  Download, 
  Filter, 
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

export const TransactionHistory: React.FC = () => {
  const { user } = useAuth();
  const { payments, loading, stats } = usePayments(user?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = 
      payment.job_id?.includes(searchQuery) ||
      payment.stripe_payment_intent_id?.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      case 'refunded': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const isIncoming = (payment: any) => payment.professional_id === user?.id;

  const exportTransactions = () => {
    const csv = [
      ['Date', 'Type', 'Amount', 'Currency', 'Status', 'Job ID'].join(','),
      ...filteredPayments.map(p => [
        format(new Date(p.created_at), 'yyyy-MM-dd HH:mm'),
        isIncoming(p) ? 'Income' : 'Payment',
        p.amount,
        p.currency,
        p.status,
        p.job_id || '-'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
              <p className="text-2xl font-bold">{stats.count}</p>
            </div>
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">${stats.total.toFixed(2)}</p>
            </div>
            <ArrowUpRight className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold">{stats.failed}</p>
            </div>
            <ArrowDownRight className="h-8 w-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by job ID or payment ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="all">All Status</option>
            <option value="succeeded">Succeeded</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <Button variant="outline" onClick={exportTransactions}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </Card>

      {/* Transactions List */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Recent Transactions</h3>
        {filteredPayments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No transactions found
          </p>
        ) : (
          <div className="space-y-3">
            {filteredPayments.map((payment) => (
              <Card key={payment.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${
                      isIncoming(payment) ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {isIncoming(payment) ? (
                        <ArrowDownRight className="h-5 w-5 text-green-600" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {isIncoming(payment) ? 'Income' : 'Payment'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                      {payment.payment_method && (
                        <p className="text-xs text-muted-foreground">
                          via {payment.payment_method}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      {isIncoming(payment) ? '+' : '-'}${payment.amount.toFixed(2)}
                    </p>
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
