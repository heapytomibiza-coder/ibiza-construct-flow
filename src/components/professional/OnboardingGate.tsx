import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, FileText, Clock, XCircle, AlertCircle, Wrench, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { OnboardingProgressBar } from '@/components/onboarding/OnboardingProgressBar';
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
  const [hasConfiguredServices, setHasConfiguredServices] = useState<boolean | null>(null);

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
      // Use maybeSingle() to handle case where profile doesn't exist yet
      // .single() would throw an error and leave the gate in a broken state
      const { data, error } = await supabase
        .from('professional_profiles')
        .select('onboarding_phase, verification_status, rejection_reason')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      // Handle case where profile doesn't exist yet (new user starting onboarding)
      if (!data) {
        setProfileState({
          onboardingPhase: null,
          verificationStatus: 'pending',
          rejectionReason: null,
        });
        return;
      }

      // Type assertion since types may not be updated yet
      const profile = data as any;
      setProfileState({
        onboardingPhase: profile.onboarding_phase,
        verificationStatus: profile.verification_status,
        rejectionReason: profile.rejection_reason,
      });
    } catch (error) {
      console.error('Error loading profile state:', error);
      // Set a safe default state instead of leaving it null
      setProfileState({
        onboardingPhase: null,
        verificationStatus: 'pending',
        rejectionReason: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const checkServiceConfiguration = async () => {
    try {
      const { data, error } = await supabase
        .from('professional_services')
        .select('id')
        .eq('professional_id', userId)
        .eq('is_active', true)
        .limit(1);
      
      if (error) throw error;
      setHasConfiguredServices((data?.length || 0) > 0);
    } catch (error) {
      console.error('Error checking service configuration:', error);
      setHasConfiguredServices(false);
    }
  };

  useEffect(() => {
    // Check service configuration for verified users OR if onboarding is complete
    // This ensures the check runs for all terminal states
    if (profileState?.verificationStatus === 'verified' || 
        profileState?.onboardingPhase === 'service_configured' ||
        profileState?.onboardingPhase === 'complete') {
      checkServiceConfiguration();
    }
  }, [profileState]);

  if (loading || (profileState?.verificationStatus === 'verified' && hasConfiguredServices === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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

  // Gate 1: Awaiting documents (intro_submitted, pending)
  if (profileState.onboardingPhase === 'intro_submitted' && profileState.verificationStatus === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background to-muted/20">
        <div className="max-w-2xl w-full space-y-6">
          <OnboardingProgressBar currentPhase="verification" />
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Upload Verification Documents</CardTitle>
              <CardDescription>
                Step 2 of 3: Your profile is saved. Now we need to verify your credentials.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                We'll review your documents and get back to you within 1-2 business days.
              </p>
              <Button 
                onClick={() => navigate('/professional/verification')} 
                size="lg" 
                className="w-full"
              >
                Upload Documents
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Gate 2: Under review (verification_pending, pending)
  if (profileState.onboardingPhase === 'verification_pending' && profileState.verificationStatus === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background to-muted/20">
        <div className="max-w-2xl w-full space-y-6">
          <OnboardingProgressBar currentPhase="verification_review" />
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Verification In Progress</CardTitle>
              <CardDescription>
                Step 2 of 3: Your documents are being reviewed (typically 1-2 business days)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                <span className="text-sm font-medium">Status</span>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  Under Review
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground text-center mt-4">
                We'll email you once your verification is complete.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Gate 3: Rejected (rejected)
  if (profileState.verificationStatus === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background to-muted/20">
        <div className="max-w-2xl w-full space-y-6">
          <OnboardingProgressBar currentPhase="verification" />
          <Card className="w-full border-destructive">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle>Verification Not Approved</CardTitle>
              <CardDescription>
                We couldn't verify your documents. Please review and resubmit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileState.rejectionReason && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Reason:</strong> {profileState.rejectionReason}
                  </AlertDescription>
                </Alert>
              )}
              <p className="text-sm text-muted-foreground text-center">
                Please address the issue above and upload updated documents.
              </p>
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
      </div>
    );
  }

  // Gate 4: Services not configured (verified but no active services)
  if (
    profileState.verificationStatus === 'verified' && 
    hasConfiguredServices === false
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background to-muted/20">
        <div className="max-w-2xl w-full space-y-6">
          <OnboardingProgressBar currentPhase="service_setup" />
          <Card className="w-full border-primary">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Wrench className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Configure Your Services</CardTitle>
              <CardDescription>
                Step 3 of 3: Select which services you offer to start receiving job matches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-primary/5 border-primary/20">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertDescription>
                  <strong>Required:</strong> You must configure at least one service 
                  to complete onboarding and start receiving jobs. This helps our 
                  matching algorithm connect you with the right clients.
                </AlertDescription>
              </Alert>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Select categories you work in (e.g., Plumbing, Electrical)</p>
                <p>• Choose subcategories (e.g., Leak Repairs, Installations)</p>
                <p>• Pick specific services you offer (e.g., Burst Pipe Repair)</p>
                <p className="text-xs italic mt-3">Takes about 5-10 minutes</p>
              </div>
              <Button
                onClick={() => navigate('/professional/service-setup')}
                size="lg"
                className="w-full"
              >
                <Wrench className="w-4 h-4 mr-2" />
                Configure Services Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // All gates passed - show normal dashboard
  return <>{children}</>;
}
