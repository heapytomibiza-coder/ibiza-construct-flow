import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useJobQuotes } from '@/hooks/useJobQuotes';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Check, X, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface JobQuotesViewProps {
  jobId: string;
  isClient: boolean;
}

export function JobQuotesView({ jobId, isClient }: JobQuotesViewProps) {
  const { quotes, isLoading, acceptQuote, rejectQuote } = useJobQuotes(jobId);

  if (isLoading) {
    return <div>Loading quotes...</div>;
  }

  if (!quotes || quotes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Quotes Yet</CardTitle>
          <CardDescription>
            {isClient 
              ? "You haven't received any quotes for this job yet." 
              : "Be the first to submit a quote for this job!"}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', label: 'Pending' },
      accepted: { variant: 'default', label: 'Accepted' },
      rejected: { variant: 'destructive', label: 'Rejected' },
      withdrawn: { variant: 'outline', label: 'Withdrawn' }
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {isClient ? 'Received Quotes' : 'Your Quote'} ({quotes.length})
      </h3>

      {quotes.map((quote: any) => (
        <Card key={quote.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={quote.professional?.avatar_url} />
                  <AvatarFallback>
                    {quote.professional?.full_name?.[0] || quote.professional?.display_name?.[0] || 'P'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">
                    {quote.professional?.full_name || quote.professional?.display_name || 'Professional'}
                  </CardTitle>
                  <CardDescription>
                    Submitted {format(new Date(quote.created_at), 'PPp')}
                  </CardDescription>
                </div>
              </div>
              {getStatusBadge(quote.status)}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex gap-6">
              <div>
                <div className="text-sm text-muted-foreground">Quote Amount</div>
                <div className="text-2xl font-bold">€{quote.quote_amount.toFixed(2)}</div>
              </div>
              
              {quote.estimated_duration_hours && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                    <div className="font-medium">{quote.estimated_duration_hours} hours</div>
                  </div>
                </div>
              )}
              
              {quote.estimated_start_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Can Start</div>
                    <div className="font-medium">
                      {format(new Date(quote.estimated_start_date), 'PPP')}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <div className="text-sm font-medium mb-2">Proposal</div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {quote.proposal_message}
              </p>
            </div>

            {isClient && quote.status === 'pending' && (
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="flex-1" variant="default">
                      <Check className="mr-2 h-4 w-4" />
                      Accept Quote
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Accept This Quote?</AlertDialogTitle>
                      <AlertDialogDescription>
                        By accepting this quote, you'll begin working with this professional. 
                        You'll need to fund the escrow to proceed with the job.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => acceptQuote.mutate(quote.id)}>
                        Accept & Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reject This Quote?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will decline the professional's quote. They will be notified.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => rejectQuote.mutate({ quoteId: quote.id })}
                      >
                        Reject Quote
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
