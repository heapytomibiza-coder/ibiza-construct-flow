import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function PaymentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: contracts } = useQuery({
    queryKey: ['user-contracts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .or(`client_id.eq.${user.id},professional_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const stats = {
    totalEarnings: contracts?.reduce((sum, c) => c.work_approved_at ? sum + c.agreed_amount : sum, 0) || 0,
    pendingPayments: contracts?.filter(c => c.escrow_status === 'funded' && !c.work_approved_at).length || 0,
    completedContracts: contracts?.filter(c => c.work_approved_at).length || 0,
    activeContracts: contracts?.filter(c => !c.work_approved_at && c.escrow_status === 'funded').length || 0,
  };

  const getStatusIcon = (contract: any) => {
    if (contract.work_approved_at) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (contract.work_submitted_at) {
      return <Clock className="w-4 h-4 text-blue-500" />;
    }
    return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  };

  const getContractStatus = (contract: any) => {
    if (contract.work_approved_at) return 'completed';
    if (contract.work_submitted_at) return 'under_review';
    return 'active';
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Payment Dashboard</h1>
          <p className="text-muted-foreground">Track your earnings and payment history</p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeContracts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedContracts}</div>
            </CardContent>
          </Card>
        </div>

        {/* Contract List */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Contracts</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contracts && contracts.length > 0 ? (
                    contracts.map((contract) => (
                      <div
                        key={contract.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/contracts/${contract.id}`)}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(contract)}
                            <p className="font-medium">Contract #{contract.id.slice(0, 8)}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Created {formatDistanceToNow(new Date(contract.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-lg font-semibold">${contract.agreed_amount.toFixed(2)}</p>
                          <Badge variant={getContractStatus(contract) === 'completed' ? 'default' : 'secondary'}>
                            {getContractStatus(contract).replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No contracts yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contracts?.filter(c => !c.work_approved_at).map((contract) => (
                    <div
                      key={contract.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/contracts/${contract.id}`)}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(contract)}
                          <p className="font-medium">Contract #{contract.id.slice(0, 8)}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Created {formatDistanceToNow(new Date(contract.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-lg font-semibold">${contract.agreed_amount.toFixed(2)}</p>
                        <Badge variant="secondary">
                          {getContractStatus(contract).replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Completed Contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contracts?.filter(c => c.work_approved_at).map((contract) => (
                    <div
                      key={contract.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/contracts/${contract.id}`)}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(contract)}
                          <p className="font-medium">Contract #{contract.id.slice(0, 8)}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Completed {formatDistanceToNow(new Date(contract.work_approved_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-lg font-semibold">${contract.agreed_amount.toFixed(2)}</p>
                        <Badge variant="default">completed</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
