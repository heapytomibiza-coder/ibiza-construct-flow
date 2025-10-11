import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export function VerificationQueue() {
  const queryClient = useQueryClient();
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const [filterStatus, setFilterStatus] = useState<string>('pending');

  const { data: verifications, isLoading } = useQuery({
    queryKey: ['verifications', filterStatus],
    queryFn: async () => {
      const client: any = supabase;
      
      let query = client
        .from('professional_verifications')
        .select(`
          *,
          professional:profiles!professional_verifications_professional_id_fkey(
            id,
            full_name,
            avatar_url,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const approveVerificationMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const client: any = supabase;
      const { data: { user } } = await client.auth.getUser();
      
      const { error } = await client
        .from('professional_verifications')
        .update({
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          reviewer_notes: notes
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-verifications'] });
      toast.success('Verification approved');
    },
    onError: () => {
      toast.error('Failed to approve verification');
    }
  });

  const rejectVerificationMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const client: any = supabase;
      const { data: { user } } = await client.auth.getUser();
      
      const { error } = await client
        .from('professional_verifications')
        .update({
          status: 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          reviewer_notes: notes
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-verifications'] });
      toast.success('Verification rejected');
    },
    onError: () => {
      toast.error('Failed to reject verification');
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center">Loading verifications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Verification Queue</h2>
          <p className="text-muted-foreground">Review and approve professional verifications</p>
        </div>
        <div className="flex gap-2">
          <Badge
            variant={filterStatus === 'pending' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFilterStatus('pending')}
          >
            Pending
          </Badge>
          <Badge
            variant={filterStatus === 'approved' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFilterStatus('approved')}
          >
            Approved
          </Badge>
          <Badge
            variant={filterStatus === 'rejected' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFilterStatus('rejected')}
          >
            Rejected
          </Badge>
          <Badge
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFilterStatus('all')}
          >
            All
          </Badge>
        </div>
      </div>

      {!verifications || verifications.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No {filterStatus === 'all' ? '' : filterStatus} verifications</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {verifications.map((verification: any) => (
            <Card key={verification.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={verification.professional?.avatar_url} />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{verification.professional?.full_name}</CardTitle>
                      <CardDescription>{verification.professional?.email}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {verification.verification_method}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {verification.verification_data && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Verification Details</h4>
                    <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto">
                      {JSON.stringify(verification.verification_data, null, 2)}
                    </pre>
                  </div>
                )}

                {verification.documents && verification.documents.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Documents</h4>
                    <div className="flex flex-wrap gap-2">
                      {verification.documents.map((doc: string, index: number) => (
                        <a
                          key={index}
                          href={doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Document {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold mb-2">Review Notes (Optional)</h4>
                  <Textarea
                    placeholder="Add notes about this verification review..."
                    value={reviewNotes[verification.id] || ''}
                    onChange={(e) => setReviewNotes({
                      ...reviewNotes,
                      [verification.id]: e.target.value
                    })}
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => approveVerificationMutation.mutate({
                      id: verification.id,
                      notes: reviewNotes[verification.id]
                    })}
                    disabled={approveVerificationMutation.isPending}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (!reviewNotes[verification.id]) {
                        toast.error('Please add notes when rejecting');
                        return;
                      }
                      rejectVerificationMutation.mutate({
                        id: verification.id,
                        notes: reviewNotes[verification.id]
                      });
                    }}
                    disabled={rejectVerificationMutation.isPending}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Submitted: {new Date(verification.created_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
