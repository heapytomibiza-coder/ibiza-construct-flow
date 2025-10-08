import { useState } from 'react';
import { useProfileModerate } from '../../../packages/@contracts/clients/admin';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

/**
 * Admin Profile Moderation Queue
 * Phase 5: UI Component for moderating profile verifications
 */

export default function ProfileModerationQueue() {
  const { toast } = useToast();
  const moderateMutation = useProfileModerate();
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  // Fetch pending profiles
  const { data: profiles, isLoading, refetch } = useQuery({
    queryKey: ['profiles', 'pending_verification'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, display_name, email, verification_status, created_at')
        .in('verification_status', ['pending', 'under_review'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const handleModerate = async (profileId: string, action: 'approve' | 'reject' | 'under_review') => {
    try {
      await moderateMutation.mutateAsync({
        profile_id: profileId,
        action,
        notes: notes || undefined,
      });

      toast({
        title: 'Success',
        description: `Profile ${action}d successfully`,
      });

      setSelectedProfile(null);
      setNotes('');
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to moderate profile',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Profile Moderation Queue</h2>
        <p className="text-muted-foreground">
          Review and moderate pending profile verifications
        </p>
      </div>

      {profiles?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No profiles pending verification</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {profiles?.map((profile: any) => (
            <Card key={profile.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{profile.full_name || profile.display_name || 'Unnamed'}</CardTitle>
                    <CardDescription>{profile.email}</CardDescription>
                  </div>
                  <Badge variant={profile.verification_status === 'under_review' ? 'secondary' : 'default'}>
                    {profile.verification_status === 'under_review' ? (
                      <Clock className="mr-1 h-3 w-3" />
                    ) : null}
                    {profile.verification_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>Profile ID: {profile.id}</p>
                  <p>Created: {new Date(profile.created_at).toLocaleString()}</p>
                </div>

                {selectedProfile === profile.id && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="space-y-2">
                      <Label htmlFor={`notes-${profile.id}`}>Moderation Notes (Optional)</Label>
                      <Textarea
                        id={`notes-${profile.id}`}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any notes about this moderation decision..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {selectedProfile === profile.id ? (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleModerate(profile.id, 'approve')}
                        disabled={moderateMutation.isPending}
                      >
                        {moderateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleModerate(profile.id, 'reject')}
                        disabled={moderateMutation.isPending}
                      >
                        {moderateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleModerate(profile.id, 'under_review')}
                        disabled={moderateMutation.isPending}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Under Review
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedProfile(null);
                          setNotes('');
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProfile(profile.id)}
                    >
                      Moderate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
