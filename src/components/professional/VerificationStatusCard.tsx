import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Shield, CheckCircle, Clock, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface VerificationStatusCardProps {
  userId: string;
}

export function VerificationStatusCard({ userId }: VerificationStatusCardProps) {
  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadVerificationStatus();

    // Real-time subscription for verification updates
    const channel = supabase
      .channel('verification-status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'professional_verifications',
          filter: `professional_id=eq.${userId}`
        },
        () => {
          loadVerificationStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadVerificationStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('professional_verifications')
        .select('*')
        .eq('professional_id', userId)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setVerification(data);
    } catch (error) {
      console.error('Error loading verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-950/20',
          borderColor: 'border-green-200 dark:border-green-800',
          label: 'Verified',
          variant: 'default' as const
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          label: 'Under Review',
          variant: 'outline' as const
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          borderColor: 'border-red-200 dark:border-red-800',
          label: 'Rejected',
          variant: 'destructive' as const
        };
      case 'expired':
        return {
          icon: AlertCircle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 dark:bg-orange-950/20',
          borderColor: 'border-orange-200 dark:border-orange-800',
          label: 'Expired',
          variant: 'secondary' as const
        };
      default:
        return {
          icon: Shield,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          borderColor: 'border-border',
          label: 'Not Verified',
          variant: 'outline' as const
        };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const status = verification?.status || 'none';
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Card className={`${config.borderColor} border-2`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5" />
          Verification Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`flex items-center gap-3 p-4 rounded-lg ${config.bgColor}`}>
          <Icon className={`h-8 w-8 ${config.color}`} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">
                {status === 'none' ? 'Not Submitted' : config.label}
              </h3>
              {verification && (
                <Badge variant={config.variant}>{verification.status}</Badge>
              )}
            </div>
            {verification ? (
              <p className="text-sm text-muted-foreground">
                Submitted {format(new Date(verification.submitted_at), 'PPP')}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Get verified to increase your booking opportunities
              </p>
            )}
          </div>
        </div>

        {verification?.expires_at && verification.status === 'approved' && (
          <div className="text-sm text-muted-foreground">
            Expires: {format(new Date(verification.expires_at), 'PPP')}
          </div>
        )}

        {verification?.reviewer_notes && verification.status === 'rejected' && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm font-medium mb-1">Review Notes:</p>
            <p className="text-sm text-muted-foreground">{verification.reviewer_notes}</p>
          </div>
        )}

        <div className="flex gap-2">
          {!verification || verification.status === 'rejected' || verification.status === 'expired' ? (
            <Button 
              onClick={() => navigate('/professional/verification')}
              className="w-full"
            >
              {verification ? 'Resubmit Verification' : 'Start Verification'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : verification.status === 'pending' ? (
            <Button 
              variant="outline"
              onClick={() => navigate('/professional/verification')}
              className="w-full"
            >
              View Status
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              variant="outline"
              onClick={() => navigate('/professional/verification')}
              className="w-full"
            >
              View Verification
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
