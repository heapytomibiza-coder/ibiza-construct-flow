import { useAuth } from '@/hooks/useAuth';
import { usePayouts } from '@/hooks/usePayouts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

export const PayoutManagement = () => {
  const { user } = useAuth();
  const { payoutAccount, payouts, stats, loading, createConnectAccount, requestPayout } = usePayouts(user?.id);

  const handleRequestPayout = async () => {
    if (stats.availableBalance > 0) {
      try {
        await requestPayout(stats.availableBalance);
      } catch (error) {
        console.error('Payout request failed:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!payoutAccount) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Set Up Payouts</CardTitle>
          <CardDescription>
            Connect your Stripe account to receive payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To receive payouts for your completed work, you'll need to set up a Stripe Connect account.
            This is a secure way to receive payments directly to your bank account.
          </p>
          <Button onClick={createConnectAccount} className="w-full">
            <ExternalLink className="w-4 h-4 mr-2" />
            Set Up Payout Account
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!payoutAccount.details_submitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Complete Account Setup</CardTitle>
          <CardDescription>
            Finish setting up your payout account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your payout account needs additional information before you can receive payments.
            Click below to complete the setup process.
          </p>
          <Button onClick={createConnectAccount} className="w-full">
            <ExternalLink className="w-4 h-4 mr-2" />
            Complete Setup
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Earnings Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.pendingEarnings)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.availableBalance)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Request Payout Button */}
      {stats.availableBalance > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Button onClick={handleRequestPayout} className="w-full" size="lg">
              <DollarSign className="w-4 h-4 mr-2" />
              Request Payout ({formatCurrency(stats.availableBalance)})
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Your recent payout requests</CardDescription>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No payouts yet
            </p>
          ) : (
            <div className="space-y-4">
              {payouts.map((payout) => (
                <div
                  key={payout.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(payout.status)}
                    <div>
                      <p className="font-medium">{formatCurrency(payout.amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(payout.requested_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(payout.status)}>
                    {payout.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold">
              {payouts.filter(p => p.status === 'paid').length}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold">
              {payouts.filter(p => p.status === 'pending' || p.status === 'processing').length}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Paid Out</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.paidOut)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
