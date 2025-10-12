import { useAuth } from '@/hooks/useAuth';
import { usePayouts } from '@/hooks/usePayouts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { Loader2, DollarSign, TrendingUp, Clock, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { PayoutRequestDialog } from '@/components/payments/PayoutRequestDialog';
import { useStripeConnect } from '@/hooks/useStripeConnect';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ProfessionalEarningsPage() {
  const { user } = useAuth();
  const { payouts, earnings, loading, stats } = usePayouts(user?.id);
  const { stripeAccount, setupStripeConnect, isAccountActive, isLoading: stripeLoading } = useStripeConnect();
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);

  if (loading || stripeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Earnings Dashboard</h1>
          <p className="text-muted-foreground">Track your income and request payouts</p>
        </div>
        {isAccountActive && (
          <Button onClick={() => setPayoutDialogOpen(true)} size="lg">
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Request Payout
          </Button>
        )}
      </div>

      {/* Stripe Connect Status */}
      {!isAccountActive && (
        <Alert>
          <AlertDescription className="flex items-center justify-between">
            <span>Set up your payout account to receive payments</span>
            <Button onClick={setupStripeConnect} disabled={stripeLoading}>
              Setup Stripe Connect
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.availableBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Ready for payout</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.totalEarnings - stats.paidOut).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">In escrow</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Earnings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Earnings</CardTitle>
          <CardDescription>Your latest completed payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {earnings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No earnings yet</p>
            ) : (
              earnings.slice(0, 10).map((earning) => (
                <div key={earning.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Job Payment</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(earning.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                  <div className="text-right">
                      <p className="text-sm font-semibold">${earning.amount}</p>
                      <p className="text-xs text-muted-foreground">
                        Net: ${earning.net_amount}
                      </p>
                    </div>
                    <Badge variant={earning.status === 'paid' ? 'default' : 'secondary'}>
                      {earning.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Track your withdrawal requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payouts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No payouts yet</p>
            ) : (
              payouts.map((payout) => (
                <div key={payout.id}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Payout Request</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payout.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold">${payout.amount}</p>
                    <Badge
                        variant={
                          payout.status === 'paid'
                            ? 'default'
                            : payout.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {payout.status === 'paid' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {payout.status}
                      </Badge>
                    </div>
                  </div>
                  {payout.status === 'paid' && payout.paid_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Completed: {new Date(payout.paid_at).toLocaleDateString()}
                    </p>
                  )}
                  <Separator className="mt-4" />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <PayoutRequestDialog
        open={payoutDialogOpen}
        onOpenChange={setPayoutDialogOpen}
        availableBalance={stats.availableBalance}
      />
    </div>
  );
}
