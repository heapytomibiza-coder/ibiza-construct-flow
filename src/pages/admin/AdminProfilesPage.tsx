import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function AdminProfilesPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: verifications, isLoading } = useQuery({
    queryKey: ['admin-verifications', activeTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_verifications')
        .select('*, professional_profiles!inner(*, profiles(full_name, display_name))')
        .eq('status', activeTab)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateVerificationMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      const { error } = await supabase
        .from('professional_verifications')
        .update({ 
          status, 
          reviewer_notes: reason,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
      toast({
        title: 'Success',
        description: 'Verification status updated',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update verification',
        variant: 'destructive',
      });
    },
  });

  const handleApprove = (id: string) => {
    updateVerificationMutation.mutate({ id, status: 'approved' });
  };

  const handleReject = (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      updateVerificationMutation.mutate({ id, status: 'rejected', reason });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Verifications</h1>
        <p className="text-muted-foreground">Review and approve professional profiles</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading verifications...</div>
            </div>
          ) : verifications?.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">No {activeTab} verifications</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {verifications?.map((verification) => (
                <Card key={verification.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">
                            {verification.professional_profiles?.profiles?.full_name ||
                              verification.professional_profiles?.profiles?.display_name ||
                              'Unknown Professional'}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Method: {verification.verification_method}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Submitted: {format(new Date(verification.created_at), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                        <Badge variant={activeTab === 'approved' ? 'secondary' : 'default'}>
                          {verification.status}
                        </Badge>
                      </div>


                      {activeTab === 'pending' && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(verification.id)}
                            disabled={updateVerificationMutation.isPending}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(verification.id)}
                            disabled={updateVerificationMutation.isPending}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}

                      {verification.reviewer_notes && (
                        <div className="bg-destructive/10 p-3 rounded-md">
                          <p className="text-sm font-medium">Reviewer Notes:</p>
                          <p className="text-sm text-muted-foreground">{verification.reviewer_notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
