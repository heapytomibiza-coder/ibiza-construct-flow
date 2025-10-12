import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function AdminJobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['admin-jobs', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch client profiles separately
      const jobsWithProfiles = await Promise.all(
        (data || []).map(async (job) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, display_name')
            .eq('id', job.client_id)
            .single();
          
          return { ...job, profile };
        })
      );
      
      return jobsWithProfiles;
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'secondary',
      open: 'default',
      in_progress: 'default',
      completed: 'secondary',
      cancelled: 'destructive',
    };
    return colors[status] || 'secondary';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Job Management</h1>
        <p className="text-muted-foreground">Oversee all jobs on the platform</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search jobs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading jobs...</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs?.map((job) => (
            <Card key={job.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{job.title}</h3>
                      <Badge variant={getStatusColor(job.status) as any}>{job.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Client: {(job as any).profile?.full_name || (job as any).profile?.display_name || 'Unknown'}</span>
                      <span>•</span>
                      <span>Created: {format(new Date(job.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/jobs/${job.id}`)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
