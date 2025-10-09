import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminQueue } from '@/components/admin/shared/AdminQueue';
import { AdminDrawer } from '@/components/admin/shared/AdminDrawer';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Job {
  id: string;
  title: string;
  status: string;
  created_at: string;
  client_id: string;
  profiles: {
    full_name: string;
  } | null;
}

export default function JobsQueue() {
  const [activeFilter, setActiveFilter] = useState('open');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['admin-jobs', activeFilter],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select(`
          id,
          title,
          status,
          created_at,
          client_id,
          profiles:client_id (
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (activeFilter !== 'all') {
        query = query.eq('status', activeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as Job[];
    },
  });

  const columns = [
    {
      key: 'title',
      label: 'Job Title',
      render: (item: Job) => (
        <div>
          <p className="font-medium">{item.title}</p>
          <p className="text-sm text-muted-foreground">
            by {item.profiles?.full_name || 'Unknown'}
          </p>
        </div>
      ),
    },
    {
      key: 'budget',
      label: 'Budget',
      render: () => 'See details',
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Job) => {
        const variant = item.status === 'completed' ? 'default' : 
                       item.status === 'cancelled' ? 'destructive' : 'secondary';
        return <Badge variant={variant}>{item.status}</Badge>;
      },
    },
    {
      key: 'created_at',
      label: 'Posted',
      render: (item: Job) => format(new Date(item.created_at), 'MMM d, yyyy'),
    },
  ];

  const filters = [
    { id: 'open', label: 'Open' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'all', label: 'All' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Jobs & Bookings Queue</h1>
          <p className="text-sm text-muted-foreground">
            Manage jobs and booking requests
          </p>
        </div>

        <AdminQueue
          title="Jobs"
          description="View and manage platform jobs"
          columns={columns}
          data={jobs || []}
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onRowClick={(item) => setSelectedJob(item)}
          isLoading={isLoading}
          searchPlaceholder="Search jobs..."
        />

        <AdminDrawer
          open={!!selectedJob}
          onOpenChange={(open) => !open && setSelectedJob(null)}
          title="Job Details"
          description="View job information and history"
        >
          {selectedJob && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Job Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Title:</span> {selectedJob.title}</p>
                  <p><span className="text-muted-foreground">Client:</span> {selectedJob.profiles?.full_name}</p>
                  <p><span className="text-muted-foreground">Status:</span> {selectedJob.status}</p>
                  <p><span className="text-muted-foreground">Posted:</span> {format(new Date(selectedJob.created_at), 'PPP')}</p>
                </div>
              </div>
            </div>
          )}
        </AdminDrawer>
      </div>
    </AdminLayout>
  );
}
