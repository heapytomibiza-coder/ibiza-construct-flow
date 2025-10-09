import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';

export function ActionQueues() {
  const { data: verificationCount } = useQuery({
    queryKey: ['pending-verifications-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('professional_verifications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      return count || 0;
    },
  });

  const { data: ticketCount } = useQuery({
    queryKey: ['open-tickets-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .in('status', ['open', 'in_progress']);
      return count || 0;
    },
  });

  const { data: jobCount } = useQuery({
    queryKey: ['open-jobs-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');
      return count || 0;
    },
  });

  const queues = [
    {
      label: 'Pending Verifications',
      count: verificationCount || 0,
      link: '/admin/profiles',
    },
    {
      label: 'Open Support Tickets',
      count: ticketCount || 0,
      link: '/admin/helpdesk',
    },
    {
      label: 'Jobs Pending Approval',
      count: jobCount || 0,
      link: '/admin/jobs',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Action Queues</CardTitle>
        <p className="text-sm text-muted-foreground">Tasks awaiting review</p>
        <Separator className="my-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {queues.map((queue) => (
          <div key={queue.label} className="flex items-center justify-between">
            <span className="text-sm">{queue.label}</span>
            <Button size="sm" asChild>
              <Link to={queue.link}>Review ({queue.count})</Link>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
