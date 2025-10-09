import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';

export function ActionQueues() {
  // Simplified implementation - will add real queries later
  const queues = [
    {
      label: 'Pending Verifications',
      count: 0,
      link: '/admin/profiles',
    },
    {
      label: 'Open Support Tickets',
      count: 0,
      link: '/admin/helpdesk',
    },
    {
      label: 'Jobs Pending Approval',
      count: 0,
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
