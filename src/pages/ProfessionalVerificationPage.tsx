import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { VerificationStatus } from '@/components/professional/verification/VerificationStatus';
import { VerificationForm } from '@/components/professional/verification/VerificationForm';
import { DocumentUpload } from '@/components/professional/verification/DocumentUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfessionalVerificationPage() {
  const navigate = useNavigate();
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [skipping, setSkipping] = useState(false);

  useEffect(() => {
    loadProfessionalProfile();
  }, []);

  const loadProfessionalProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      // Check if professional profile exists
      const { data: profile, error } = await supabase
        .from('professional_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading professional profile:', error);
        return;
      }

      if (profile) {
        setProfessionalId(profile.user_id);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-6xl py-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const handleSkipVerification = async () => {
    try {
      setSkipping(true);
      
      // Update onboarding phase to indicate verification was skipped
      const { error } = await supabase
        .from('professional_profiles')
        .update({
          onboarding_phase: 'service_configured',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', professionalId);

      if (error) throw error;

      toast.success('You can complete verification anytime from your dashboard');
      navigate('/dashboard/pro');
    } catch (error) {
      console.error('Error skipping verification:', error);
      toast.error('Failed to skip verification');
    } finally {
      setSkipping(false);
    }
  };

  if (!professionalId) {
    return (
      <div className="container max-w-6xl py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Professional profile not found. Please complete your profile setup first.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: 'Professional Dashboard', href: '/dashboard/pro' },
            { label: 'Verification' }
          ]}
        />

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Professional Verification</h1>
            <p className="text-muted-foreground mt-2">
              Complete your verification to start receiving job opportunities
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleSkipVerification}
            disabled={skipping}
          >
            Skip for Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You can complete verification later from your dashboard. Verified professionals get priority in search results and build more trust with clients.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="submit">Submit Request</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-6">
            <VerificationStatus professionalId={professionalId} />
          </TabsContent>

          <TabsContent value="submit" className="space-y-6">
            <VerificationForm
              professionalId={professionalId}
              onSuccess={() => {
                // Switch to status tab after successful submission
                const statusTab = document.querySelector('[value="status"]') as HTMLElement;
                statusTab?.click();
              }}
            />
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <DocumentUpload
              professionalId={professionalId}
              onDocumentsUpdate={() => {
                console.log('Documents updated');
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
