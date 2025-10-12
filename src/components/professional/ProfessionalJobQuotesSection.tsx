import { useProfessionalJobQuotes } from '@/hooks/useProfessionalJobQuotes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Clock, Euro, CheckCircle, XCircle, Send, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getJobRoute } from '@/lib/navigation';

interface ProfessionalJobQuotesSectionProps {
  professionalId: string;
}

export const ProfessionalJobQuotesSection = ({ professionalId }: ProfessionalJobQuotesSectionProps) => {
  const { quotes, isLoading, withdrawQuote } = useProfessionalJobQuotes(professionalId);
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { variant: 'default' as const, label: 'Pending Review', icon: Clock, color: 'bg-yellow-500' },
      accepted: { variant: 'default' as const, label: 'Accepted', icon: CheckCircle, color: 'bg-green-500' },
      rejected: { variant: 'outline' as const, label: 'Declined', icon: XCircle, color: 'bg-red-500' },
      withdrawn: { variant: 'outline' as const, label: 'Withdrawn', icon: XCircle, color: 'bg-gray-400' }
    };
    const { variant, label, icon: Icon, color } = config[status as keyof typeof config] || config.pending;
    return (
      <Badge variant={variant} className={`${color} text-white gap-1`}>
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  const handleWithdraw = async (quoteId: string) => {
    if (!confirm('Are you sure you want to withdraw this quote?')) return;
    withdrawQuote.mutate(quoteId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Quotes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const pendingQuotes = quotes.filter(q => q.status === 'pending');
  const acceptedQuotes = quotes.filter(q => q.status === 'accepted');
  const otherQuotes = quotes.filter(q => ['rejected', 'withdrawn'].includes(q.status));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>My Quotes</span>
          <Badge variant="secondary">{pendingQuotes.length} pending</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {quotes.length === 0 ? (
          <div className="text-center py-12">
            <Send className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No quotes submitted yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Browse open jobs and submit quotes to start working
            </p>
            <Button 
              onClick={() => navigate('/discovery')} 
              className="mt-4 bg-gradient-hero"
            >
              Find Jobs
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Quotes */}
            {pendingQuotes.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pending Review ({pendingQuotes.length})
                </h4>
                <div className="space-y-3">
                  {pendingQuotes.map((quote) => (
                    <QuoteCard
                      key={quote.id}
                      quote={quote}
                      onWithdraw={() => handleWithdraw(quote.id)}
                      onViewJob={() => navigate(getJobRoute(quote.job_id))}
                      getStatusBadge={getStatusBadge}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Accepted Quotes */}
            {acceptedQuotes.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Accepted ({acceptedQuotes.length})
                </h4>
                <div className="space-y-3">
                  {acceptedQuotes.map((quote) => (
                    <QuoteCard
                      key={quote.id}
                      quote={quote}
                      onViewJob={() => navigate(getJobRoute(quote.job_id))}
                      getStatusBadge={getStatusBadge}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Quotes (Rejected/Withdrawn) */}
            {otherQuotes.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Past Quotes ({otherQuotes.length})</h4>
                <div className="space-y-3">
                  {otherQuotes.slice(0, 3).map((quote) => (
                    <QuoteCard
                      key={quote.id}
                      quote={quote}
                      onViewJob={() => navigate(getJobRoute(quote.job_id))}
                      getStatusBadge={getStatusBadge}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface QuoteCardProps {
  quote: any;
  onWithdraw?: () => void;
  onViewJob: () => void;
  getStatusBadge: (status: string) => JSX.Element;
}

const QuoteCard = ({ quote, onWithdraw, onViewJob, getStatusBadge }: QuoteCardProps) => (
  <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
    <div className="flex items-start justify-between mb-2">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold">{quote.job?.title || 'Job'}</h4>
          {getStatusBadge(quote.status)}
        </div>
        <p className="text-sm text-muted-foreground">
          Client: {quote.job?.client?.[0]?.full_name || quote.job?.client?.[0]?.display_name || 'Unknown'}
        </p>
      </div>
      <span className="text-xs text-muted-foreground">
        {format(new Date(quote.created_at), 'MMM dd, yyyy')}
      </span>
    </div>

    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
      {quote.job?.description || ''}
    </p>

    <div className="flex items-center gap-2 mb-3">
      <Euro className="w-4 h-4 text-primary" />
      <span className="font-semibold">Your Quote: €{quote.quote_amount.toFixed(2)}</span>
      {quote.estimated_duration_hours && (
        <span className="text-sm text-muted-foreground ml-2">
          · {quote.estimated_duration_hours}h estimated
        </span>
      )}
    </div>

    {quote.proposal_message && (
      <div className="text-sm text-muted-foreground mb-3 p-2 bg-muted/50 rounded">
        <FileText className="w-3 h-3 inline mr-1" />
        {quote.proposal_message.substring(0, 100)}
        {quote.proposal_message.length > 100 && '...'}
      </div>
    )}

    <div className="flex gap-2 mt-3">
      <Button size="sm" onClick={onViewJob} className="flex-1">
        View Job
      </Button>
      {quote.status === 'pending' && onWithdraw && (
        <Button size="sm" variant="outline" onClick={onWithdraw}>
          Withdraw
        </Button>
      )}
    </div>
  </div>
);
