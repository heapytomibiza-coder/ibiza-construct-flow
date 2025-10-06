import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMediation } from '@/hooks/useMediation';
import { MessageSquare, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CounterProposalListProps {
  disputeId: string;
}

export function CounterProposalList({ disputeId }: CounterProposalListProps) {
  const { counters } = useMediation(disputeId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500/10 text-green-500';
      case 'rejected':
        return 'bg-red-500/10 text-red-500';
      case 'withdrawn':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-yellow-500/10 text-yellow-500';
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Counter-Proposals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {counters.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading counter-proposals...</div>
        ) : (counters.data ?? []).length === 0 ? (
          <div className="p-4 rounded-lg bg-muted/50 text-center text-sm text-muted-foreground">
            No counter-proposals yet
          </div>
        ) : (
          <div className="space-y-3">
            {(counters.data ?? []).map((c) => (
              <div key={c.id} className="p-4 rounded-lg bg-card border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(c.status)}>
                    {c.status}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                  </div>
                </div>

                {c.note && (
                  <div className="text-sm">{c.note}</div>
                )}

                <div className="text-xs text-muted-foreground">
                  <div className="font-medium mb-1">Terms:</div>
                  <pre className="whitespace-pre-wrap break-words bg-muted/50 p-2 rounded">
                    {JSON.stringify(c.terms, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
