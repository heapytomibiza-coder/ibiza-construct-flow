import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface Payout {
  id: string;
  amount: number;
  status: 'pending' | 'in_transit' | 'completed' | 'failed';
  requestedDate: string;
  estimatedArrival?: string;
  completedDate?: string;
  description: string;
}

export const PayoutManagement = () => {
  const { toast } = useToast();
  const [availableBalance] = useState(2450.00);
  const [payouts] = useState<Payout[]>([
    {
      id: '1',
      amount: 850.00,
      status: 'in_transit',
      requestedDate: '2025-10-01',
      estimatedArrival: '2025-10-05',
      description: 'Bathroom renovation - Final payment'
    },
    {
      id: '2',
      amount: 1200.00,
      status: 'completed',
      requestedDate: '2025-09-15',
      completedDate: '2025-09-18',
      description: 'Kitchen installation - Milestone 2'
    },
    {
      id: '3',
      amount: 500.00,
      status: 'pending',
      requestedDate: '2025-10-03',
      description: 'Electrical work - Initial payment'
    }
  ]);

  const handleRequestPayout = () => {
    toast({
      title: "Payout requested",
      description: "Your payout request has been submitted and will be processed within 2-3 business days."
    });
  };

  const getStatusBadge = (status: Payout['status']) => {
    const variants: Record<Payout['status'], { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      in_transit: { variant: "default", label: "In Transit" },
      completed: { variant: "outline", label: "Completed" },
      failed: { variant: "destructive", label: "Failed" }
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const pendingPayouts = payouts.filter(p => p.status === 'pending' || p.status === 'in_transit');
  const completedPayouts = payouts.filter(p => p.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${availableBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready to withdraw
            </p>
            <Button 
              className="w-full mt-4" 
              onClick={handleRequestPayout}
              disabled={availableBalance === 0}
            >
              Request Payout
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayouts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(completedPayouts.reduce((sum, p) => sum + p.amount, 0) + availableBalance).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Track your earnings and payout requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">Pending & In Transit</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="space-y-4 mt-4">
              {pendingPayouts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No pending payouts</p>
                </div>
              ) : (
                pendingPayouts.map(payout => (
                  <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">${payout.amount.toFixed(2)}</p>
                        {getStatusBadge(payout.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{payout.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Requested: {new Date(payout.requestedDate).toLocaleDateString()}</span>
                        {payout.estimatedArrival && (
                          <span>Est. Arrival: {new Date(payout.estimatedArrival).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-4">
              {completedPayouts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No completed payouts yet</p>
                </div>
              ) : (
                completedPayouts.map(payout => (
                  <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">${payout.amount.toFixed(2)}</p>
                        {getStatusBadge(payout.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{payout.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Requested: {new Date(payout.requestedDate).toLocaleDateString()}</span>
                        {payout.completedDate && (
                          <span>Completed: {new Date(payout.completedDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
