import { useState } from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminQueue, Column, FilterChip } from '@/components/admin/shared/AdminQueue';
import { AdminDrawer } from '@/components/admin/shared/AdminDrawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface Dispute {
  id: string;
  job_id: string;
  raised_by: string;
  against_user_id: string;
  dispute_type: string;
  status: string;
  amount_disputed: number | null;
  description: string;
  created_at: string;
  resolved_at: string | null;
  raiser: {
    full_name: string;
    display_name: string;
  } | null;
  against: {
    full_name: string;
    display_name: string;
  } | null;
}

export default function DisputesQueue() {
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('open');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: disputes, isLoading } = useQuery({
    queryKey: ['admin-disputes', activeFilter],
    queryFn: async () => {
      let query = supabase
        .from('disputes')
        .select(`
          *,
          raiser:profiles!disputes_raised_by_fkey(full_name, display_name),
          against:profiles!disputes_against_user_id_fkey(full_name, display_name)
        `)
        .order('created_at', { ascending: false });

      if (activeFilter !== 'all') {
        query = query.eq('status', activeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as Dispute[];
    },
  });

  const updateDisputeMutation = useMutation({
    mutationFn: async ({ disputeId, status }: { disputeId: string; status: string }) => {
      const { error } = await supabase
        .from('disputes')
        .update({
          status,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null,
        })
        .eq('id', disputeId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Dispute Updated',
        description: 'Dispute status has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] });
      setSelectedDispute(null);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update dispute. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'destructive' | 'secondary' | 'outline'; label: string }> = {
      open: { variant: 'destructive', label: 'Open' },
      in_progress: { variant: 'secondary', label: 'In Progress' },
      resolved: { variant: 'default', label: 'Resolved' },
    };
    const config = variants[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns: Column<Dispute>[] = [
    {
      key: 'dispute_type',
      label: 'Type',
      render: (dispute) => (
        <span className="capitalize">{dispute.dispute_type.replace(/_/g, ' ')}</span>
      ),
    },
    {
      key: 'raised_by',
      label: 'Raised By',
      render: (dispute) => dispute.raiser?.full_name || dispute.raiser?.display_name || 'Unknown',
    },
    {
      key: 'against_user_id',
      label: 'Against',
      render: (dispute) => dispute.against?.full_name || dispute.against?.display_name || 'Unknown',
    },
    {
      key: 'status',
      label: 'Status',
      render: (dispute) => getStatusBadge(dispute.status),
    },
    {
      key: 'amount_disputed',
      label: 'Amount',
      render: (dispute) => dispute.amount_disputed ? `€${dispute.amount_disputed.toFixed(2)}` : 'N/A',
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (dispute) => new Date(dispute.created_at).toLocaleDateString(),
    },
  ];

  const filters: FilterChip[] = [
    { id: 'open', label: 'Open', count: disputes?.filter(d => d.status === 'open').length },
    { id: 'in_progress', label: 'In Progress', count: disputes?.filter(d => d.status === 'in_progress').length },
    { id: 'resolved', label: 'Resolved', count: disputes?.filter(d => d.status === 'resolved').length },
    { id: 'all', label: 'All', count: disputes?.length },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Disputes</h1>
          <p className="text-sm text-muted-foreground">
            Manage dispute resolution timeline
          </p>
        </div>

        <AdminQueue
          title="Disputes"
          description="View and manage platform disputes"
          columns={columns}
          data={disputes || []}
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onRowClick={(dispute) => setSelectedDispute(dispute)}
          isLoading={isLoading}
        />

        <AdminDrawer
          open={!!selectedDispute}
          onOpenChange={(open) => !open && setSelectedDispute(null)}
          title="Dispute Details"
          description="Dispute information and resolution actions"
        >
          {selectedDispute && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <div className="mt-1">{getStatusBadge(selectedDispute.status)}</div>
                  </div>
                  <div className="text-right">
                    <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                    <p className="text-base capitalize">{selectedDispute.dispute_type.replace(/_/g, ' ')}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Raised By</h3>
                  <p className="text-base">
                    {selectedDispute.raiser?.full_name || selectedDispute.raiser?.display_name || 'Unknown'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Against</h3>
                  <p className="text-base">
                    {selectedDispute.against?.full_name || selectedDispute.against?.display_name || 'Unknown'}
                  </p>
                </div>

                {selectedDispute.amount_disputed && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Amount Disputed</h3>
                    <p className="text-base font-semibold">€{selectedDispute.amount_disputed.toFixed(2)}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                  <p className="text-base mt-1">{selectedDispute.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                    <p className="text-sm">{new Date(selectedDispute.created_at).toLocaleString()}</p>
                  </div>
                  {selectedDispute.resolved_at && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Resolved</h3>
                      <p className="text-sm">{new Date(selectedDispute.resolved_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedDispute.status !== 'resolved' && (
                <div className="flex flex-col gap-2 pt-4 border-t">
                  {selectedDispute.status === 'open' && (
                    <Button
                      onClick={() => updateDisputeMutation.mutate({ 
                        disputeId: selectedDispute.id, 
                        status: 'in_progress' 
                      })}
                      disabled={updateDisputeMutation.isPending}
                      className="w-full"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Start Investigation
                    </Button>
                  )}
                  <Button
                    variant="default"
                    onClick={() => updateDisputeMutation.mutate({ 
                      disputeId: selectedDispute.id, 
                      status: 'resolved' 
                    })}
                    disabled={updateDisputeMutation.isPending}
                    className="w-full"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Resolved
                  </Button>
                </div>
              )}
            </div>
          )}
        </AdminDrawer>
      </div>
    </AdminLayout>
  );
}
