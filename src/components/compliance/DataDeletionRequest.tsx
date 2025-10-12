import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function DataDeletionRequest() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!user) return;

    setIsDeleting(true);

    try {
      // Create deletion request
      const { error } = await (supabase as any)
        .from('data_deletion_requests')
        .insert({
          user_id: user.id,
          status: 'pending',
          requested_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Your data deletion request has been submitted. We will process it within 30 days.');
      
      // Sign out user
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Deletion request error:', error);
      toast.error('Failed to submit deletion request. Please contact support.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Delete My Data</CardTitle>
        <CardDescription>
          Permanently delete all your personal data from our systems (GDPR Right to Erasure)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash2 className="mr-2 h-4 w-4" />
              Request Data Deletion
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account
                and remove all your data from our servers. You will be signed out immediately
                and your data will be deleted within 30 days.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Processing...' : 'Yes, delete my data'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <p className="mt-4 text-sm text-muted-foreground">
          According to GDPR regulations, we will delete all your personal data within 30 days
          of your request. Some data may be retained for legal compliance purposes.
        </p>
      </CardContent>
    </Card>
  );
}
