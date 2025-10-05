import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useContracts } from '@/hooks/useContracts';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface ProfessionalEarningsSectionProps {
  userId: string;
}

export const ProfessionalEarningsSection: React.FC<ProfessionalEarningsSectionProps> = ({ userId }) => {
  const { contracts, loading } = useContracts({ userId, userRole: 'professional' });
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingPayments: 0,
    completedJobs: 0,
  });

  useEffect(() => {
    if (contracts.length > 0) {
      const total = contracts
        .filter(c => c.escrow_status === 'released')
        .reduce((sum, c) => sum + c.agreed_amount, 0);
      
      const pending = contracts
        .filter(c => c.escrow_status === 'held')
        .reduce((sum, c) => sum + c.agreed_amount, 0);
      
      const completed = contracts.filter(c => c.escrow_status === 'released').length;

      setStats({
        totalEarnings: total,
        pendingPayments: pending,
        completedJobs: completed,
      });
    }
  }, [contracts]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      none: { label: 'Awaiting Payment', variant: 'outline' },
      pending: { label: 'Processing', variant: 'secondary' },
      held: { label: 'In Escrow', variant: 'default' },
      released: { label: 'Paid', variant: 'default' },
    };
    
    const config = variants[status] || variants.none;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Loading earnings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">${stats.pendingPayments.toFixed(2)}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Jobs</p>
                <p className="text-2xl font-bold">{stats.completedJobs}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Earnings History
          </CardTitle>
          <CardDescription>
            Track your payments and contract earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No contracts yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">
                      {contract.job?.title || 'Service Contract'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Client: {contract.client?.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(contract.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  
                  <div className="text-right mr-4">
                    <p className="font-semibold text-lg">
                      ${contract.agreed_amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {contract.type}
                    </p>
                  </div>

                  {getStatusBadge(contract.escrow_status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
