import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useBookingRequests } from '@/hooks/useBookingRequests';
import { format } from 'date-fns';
import { Clock, Euro, MessageSquare, CheckCircle, XCircle, Send, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { z } from 'zod';

const quoteResponseSchema = z.object({
  quote: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Please enter a valid amount',
  }),
  notes: z.string().trim().min(20, 'Please provide more details (at least 20 characters)').max(500),
});

interface ProfessionalQuotesSectionProps {
  professionalId: string;
}

export const ProfessionalQuotesSection = ({ professionalId }: ProfessionalQuotesSectionProps) => {
  const { requests, loading, sendQuote, updateRequestStatus } = useBookingRequests({
    userId: professionalId,
    userRole: 'professional'
  });

  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ quote: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { variant: 'default' as const, label: 'Pending', color: 'bg-yellow-500' },
      quoted: { variant: 'secondary' as const, label: 'Quoted', color: 'bg-blue-500' },
      accepted: { variant: 'default' as const, label: 'Accepted', color: 'bg-green-500' },
      declined: { variant: 'outline' as const, label: 'Declined', color: 'bg-gray-400' },
      responded: { variant: 'secondary' as const, label: 'Responded', color: 'bg-blue-500' }
    };
    const { variant, label, color } = config[status as keyof typeof config] || config.pending;
    return <Badge variant={variant} className={color}>{label}</Badge>;
  };

  const handleSendQuote = async () => {
    try {
      quoteResponseSchema.parse(quoteForm);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setSubmitting(true);
    try {
      await sendQuote(selectedRequest.id, Number(quoteForm.quote), quoteForm.notes.trim());
      setQuoteModalOpen(false);
      setQuoteForm({ quote: '', notes: '' });
      setSelectedRequest(null);
    } catch (error) {
      toast.error('Failed to send quote');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async (requestId: string) => {
    if (!confirm('Are you sure you want to decline this request?')) return;
    
    try {
      await updateRequestStatus(requestId, 'declined');
    } catch (error) {
      toast.error('Failed to decline request');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quote Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const quotedRequests = requests.filter(r => ['quoted', 'responded'].includes(r.status));
  const closedRequests = requests.filter(r => ['accepted', 'declined'].includes(r.status));

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Quote Requests</span>
            <Badge variant="secondary">{pendingRequests.length} pending</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No quote requests yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                You'll receive notifications when clients request quotes
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pending Requests */}
              {pendingRequests.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Pending ({pendingRequests.length})
                  </h4>
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        onSendQuote={() => {
                          setSelectedRequest(request);
                          setQuoteModalOpen(true);
                        }}
                        onDecline={() => handleDecline(request.id)}
                        getStatusBadge={getStatusBadge}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quoted Requests */}
              {quotedRequests.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Quoted ({quotedRequests.length})
                  </h4>
                  <div className="space-y-3">
                    {quotedRequests.map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        getStatusBadge={getStatusBadge}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Closed Requests */}
              {closedRequests.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Closed ({closedRequests.length})</h4>
                  <div className="space-y-3">
                    {closedRequests.slice(0, 3).map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
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

      {/* Quote Response Modal */}
      <Dialog open={quoteModalOpen} onOpenChange={setQuoteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Quote</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRequest && (
              <div className="p-3 bg-muted rounded-lg mb-4">
                <p className="font-semibold">{selectedRequest.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedRequest.description}
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="quote-amount">Quote Amount (€) *</Label>
              <Input
                id="quote-amount"
                type="number"
                min="0"
                step="0.01"
                value={quoteForm.quote}
                onChange={(e) => setQuoteForm({ ...quoteForm, quote: e.target.value })}
                placeholder="0.00"
              />
              {errors.quote && <p className="text-sm text-red-500 mt-1">{errors.quote}</p>}
            </div>

            <div>
              <Label htmlFor="quote-notes">Details & Timeline *</Label>
              <Textarea
                id="quote-notes"
                value={quoteForm.notes}
                onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                placeholder="Provide details about what's included, timeline, materials, terms..."
                rows={5}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
                <p className="text-xs text-muted-foreground ml-auto">{quoteForm.notes.length}/500</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setQuoteModalOpen(false)} disabled={submitting} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSendQuote} disabled={submitting} className="flex-1 bg-gradient-hero text-white">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Quote'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const RequestCard = ({ request, onSendQuote, onDecline, getStatusBadge }: any) => (
  <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
    <div className="flex items-start justify-between mb-2">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold">{request.title}</h4>
          {getStatusBadge(request.status)}
        </div>
        <p className="text-sm text-muted-foreground">From: {request.client?.full_name || 'Client'}</p>
      </div>
      <span className="text-xs text-muted-foreground">
        {format(new Date(request.created_at), 'MMM dd, yyyy')}
      </span>
    </div>

    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{request.description}</p>

    {request.location_details && (
      <p className="text-xs text-muted-foreground mb-3">📍 {request.location_details}</p>
    )}

    {request.professional_quote && (
      <div className="flex items-center gap-2 mb-3 text-sm">
        <Euro className="w-4 h-4 text-primary" />
        <span className="font-semibold">Your Quote: €{request.professional_quote}</span>
      </div>
    )}

    {request.status === 'pending' && onSendQuote && onDecline && (
      <div className="flex gap-2 mt-3">
        <Button size="sm" onClick={onSendQuote} className="flex-1">
          <Send className="w-3 h-3 mr-2" />
          Send Quote
        </Button>
        <Button size="sm" variant="outline" onClick={onDecline}>
          <XCircle className="w-3 h-3 mr-2" />
          Decline
        </Button>
      </div>
    )}
  </div>
);
