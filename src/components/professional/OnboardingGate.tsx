import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  FileText, 
  Wrench,
  ArrowRight 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OnboardingGateProps {
  userId: string;
  children: React.ReactNode;
}

interface ProfileState {
  onboardingPhase: string | null;
  verificationStatus: string;
  rejectionReason?: string | null;
}

export function OnboardingGate({ userId, children }: OnboardingGateProps) {
  const navigate = useNavigate();
  const [profileState, setProfileState] = useState<ProfileState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileState();

    // Subscribe to profile changes
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'professional_profiles',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadProfileState();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadProfileState = async () => {
    try {
      const { data, error } = await supabase
        .from('professional_profiles')
        .select('onboarding_phase, verification_status, rejection_reason')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      // Type assertion since types may not be updated yet
      const profile = data as any;
      setProfileState({
        onboardingPhase: profile.onboarding_phase,
        verificationStatus: profile.verification_status,
        rejectionReason: profile.rejection_reason,
      });
    } catch (error) {
      console.error('Error loading profile state:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Clock className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profileState) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Professional profile not found. Please complete onboarding.
        </AlertDescription>
      </Alert>
    );
  }

  // Gate 1: Awaiting documents (intro submitted, not verified yet)
  if (
    profileState.onboardingPhase === 'intro_submitted' &&
    profileState.verificationStatus === 'pending'
  ) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="w-10 h-10 text-blue-600" />
              <div>
                <CardTitle className="text-xl">Next Step: Upload Documents</CardTitle>
                <CardDescription>
                  We'll review your credentials (usually 1-2 business days)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/professional/verification')} size="lg" className="w-full">
              Upload Verification Documents
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Gate 2: Under review
  if (
    profileState.onboardingPhase === 'verification_pending' &&
    profileState.verificationStatus === 'pending'
  ) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Clock className="w-10 h-10 text-yellow-600 animate-pulse" />
              <div>
                <CardTitle className="text-xl">Under Review</CardTitle>
                <CardDescription>
                  Thanks! We're reviewing your documents. We'll email you ASAP.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <span className="text-sm font-medium">Status</span>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                In Progress
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Gate 3: Rejected (action needed)
  if (profileState.verificationStatus === 'rejected') {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Action Needed:</strong> We couldn't verify your documents.
            <br />
            <span className="text-sm mt-1 block">
              Reason: {profileState.rejectionReason || 'No reason provided'}
            </span>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Fix & Resubmit</CardTitle>
            <CardDescription>
              Please review the reason above and upload updated documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/professional/verification')}
              variant="default"
              size="lg"
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              Resubmit Documents
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Gate 4: Verified but service setup incomplete
  if (
    profileState.verificationStatus === 'verified' &&
    profileState.onboardingPhase === 'verified'
  ) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-10 h-10 text-green-600" />
              <div>
                <CardTitle className="text-xl">You're Verified ✅</CardTitle>
                <CardDescription>
                  Great! Now set up your services to start receiving jobs
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/professional/service-setup')}
              size="lg"
              className="w-full"
            >
              <Wrench className="w-4 h-4 mr-2" />
              Set Up Your Services
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // All gates passed - show normal dashboard
  return <>{children}</>;
}
