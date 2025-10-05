import React from 'react';
import { usePayouts } from '@/hooks/usePayouts';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export const PayoutDashboard: React.FC = () => {
  const { user } = useAuth();
  const { payouts, loading, requestPayout, earnings, stats } = usePayouts(user?.id);

  const handleRequestPayout = async () => {
    try {
      const result = await requestPayout();
      if (result) {
        toast.success(`Payout of $${result.amount.toFixed(2)} requested`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to request payout');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'in_transit': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle2 className="h-4 w-4" />;
      case 'in_transit': return <Clock className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
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
      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-3xl font-bold">${earnings.totalEarnings.toFixed(2)}</p>
            </div>
            <DollarSign className="h-10 w-10 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold">${earnings.pendingEarnings.toFixed(2)}</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="text-3xl font-bold">${earnings.availableForPayout.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Request Payout */}
      {earnings.availableForPayout > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Request Payout</h3>
              <p className="text-sm text-muted-foreground">
                You have ${earnings.availableForPayout.toFixed(2)} available for payout
              </p>
            </div>
            <Button onClick={handleRequestPayout}>
              Request Payout
            </Button>
          </div>
        </Card>
      )}

      {/* Payout History */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Payout History</h3>
        {payouts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No payouts yet
          </p>
        ) : (
          <div className="space-y-3">
            {payouts.map((payout) => (
              <Card key={payout.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      {getStatusIcon(payout.status)}
                    </div>
                    <div>
                      <p className="font-medium">
                        ${payout.amount.toFixed(2)} {payout.currency}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(payout.created_at), {
                          addSuffix: true
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(payout.status)}>
                      {payout.status}
                    </Badge>
                    {payout.arrival_date && payout.status === 'in_transit' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Arrives: {payout.arrival_date}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Payout Stats */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Statistics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.paid}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.inTransit}</p>
            <p className="text-sm text-muted-foreground">In Transit</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
