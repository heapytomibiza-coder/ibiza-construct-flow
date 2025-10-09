import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminQueue } from '@/components/admin/shared/AdminQueue';
import { AdminDrawer } from '@/components/admin/shared/AdminDrawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface Verification {
  id: string;
  professional_id: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    display_name: string;
  } | null;
}

export default function ProfilesQueue() {
  const [activeFilter, setActiveFilter] = useState('pending');
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);

  const { data: verifications, isLoading, refetch } = useQuery({
    queryKey: ['verifications', activeFilter],
    queryFn: async () => {
      let query = supabase
        .from('professional_verifications')
        .select(`
          id,
          professional_id,
          status,
          created_at,
          profiles:professional_id (
            full_name,
            display_name
          )
        `)
        .order('created_at', { ascending: false });

      if (activeFilter !== 'all') {
        query = query.eq('status', activeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as Verification[];
    },
  });

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('professional_verifications')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Verification approved');
      refetch();
      setSelectedVerification(null);
    } catch (error) {
      toast.error('Failed to approve verification');
      console.error(error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('professional_verifications')
        .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Verification rejected');
      refetch();
      setSelectedVerification(null);
    } catch (error) {
      toast.error('Failed to reject verification');
      console.error(error);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (item: Verification) => (
        <div>
          <p className="font-medium">{item.profiles?.full_name || 'N/A'}</p>
          <p className="text-sm text-muted-foreground">
            {item.profiles?.display_name || 'No display name'}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Verification) => {
        const variant = item.status === 'approved' ? 'default' : 
                       item.status === 'rejected' ? 'destructive' : 'secondary';
        return <Badge variant={variant}>{item.status}</Badge>;
      },
    },
    {
      key: 'created_at',
      label: 'Submitted',
      render: (item: Verification) => format(new Date(item.created_at), 'MMM d, yyyy'),
    },
  ];

  const filters = [
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'all', label: 'All' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Profile Verification Queue</h1>
          <p className="text-sm text-muted-foreground">
            Review and approve professional profiles
          </p>
        </div>

        <AdminQueue
          title="Verifications"
          description="Manage professional verification requests"
          columns={columns}
          data={verifications || []}
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onRowClick={(item) => setSelectedVerification(item)}
          isLoading={isLoading}
          searchPlaceholder="Search by name..."
        />

        <AdminDrawer
          open={!!selectedVerification}
          onOpenChange={(open) => !open && setSelectedVerification(null)}
          title="Verification Details"
          description="Review and take action on this verification request"
        >
          {selectedVerification && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Professional Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Name:</span> {selectedVerification.profiles?.full_name}</p>
                  <p><span className="text-muted-foreground">Display Name:</span> {selectedVerification.profiles?.display_name}</p>
                  <p><span className="text-muted-foreground">Status:</span> {selectedVerification.status}</p>
                  <p><span className="text-muted-foreground">Submitted:</span> {format(new Date(selectedVerification.created_at), 'PPP')}</p>
                </div>
              </div>

              {selectedVerification.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleApprove(selectedVerification.id)}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleReject(selectedVerification.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
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
