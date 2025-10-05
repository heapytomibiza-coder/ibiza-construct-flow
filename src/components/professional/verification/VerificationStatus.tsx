import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface VerificationStatusProps {
  professionalId: string;
}

interface Verification {
  id: string;
  verification_method: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  expires_at: string | null;
  reviewer_notes: string | null;
}

export const VerificationStatus = ({ professionalId }: VerificationStatusProps) => {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVerifications();

    const channel = supabase
      .channel('verification-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'professional_verifications',
          filter: `professional_id=eq.${professionalId}`,
        },
        () => loadVerifications()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [professionalId]);

  const loadVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('professional_verifications' as any)
        .select('*')
        .eq('professional_id', professionalId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setVerifications(data ? (data as any) : []);
    } catch (error) {
      console.error('Error loading verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-warning" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'expired':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      case 'expired':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      id_document: 'ID Document',
      business_license: 'Business License',
      certification: 'Professional Certification',
      insurance: 'Insurance Certificate',
    };
    return labels[method] || method;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading verification status...</p>
        </CardContent>
      </Card>
    );
  }

  if (verifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
          <CardDescription>No verification submissions yet</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Submit your verification documents to start receiving job opportunities.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Status</CardTitle>
        <CardDescription>Track your verification submissions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {verifications.map((verification) => (
          <div
            key={verification.id}
            className="flex items-start gap-4 p-4 border rounded-lg"
          >
            <div className="mt-1">{getStatusIcon(verification.status)}</div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{getMethodLabel(verification.verification_method)}</h3>
                <Badge variant={getStatusBadgeVariant(verification.status)}>
                  {verification.status}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Submitted: {format(new Date(verification.submitted_at), 'PPP')}</p>
                
                {verification.reviewed_at && (
                  <p>Reviewed: {format(new Date(verification.reviewed_at), 'PPP')}</p>
                )}
                
                {verification.expires_at && verification.status === 'approved' && (
                  <p className="text-warning">
                    Expires: {format(new Date(verification.expires_at), 'PPP')}
                  </p>
                )}
              </div>

              {verification.reviewer_notes && (
                <Alert>
                  <AlertDescription className="text-sm">
                    <strong>Admin Notes:</strong> {verification.reviewer_notes}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
