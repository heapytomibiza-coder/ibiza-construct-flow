import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { FileText, Building2, Award, Shield } from 'lucide-react';

interface VerificationFormProps {
  professionalId: string;
  onSuccess?: () => void;
}

const VERIFICATION_METHODS = [
  {
    value: 'id_document',
    label: 'ID Document',
    description: 'Government-issued photo ID (passport, driver\'s license)',
    icon: FileText,
  },
  {
    value: 'business_license',
    label: 'Business License',
    description: 'Valid business registration or trade license',
    icon: Building2,
  },
  {
    value: 'certification',
    label: 'Professional Certification',
    description: 'Industry-specific certifications or qualifications',
    icon: Award,
  },
  {
    value: 'insurance',
    label: 'Insurance Certificate',
    description: 'Professional liability or business insurance',
    icon: Shield,
  },
];

export const VerificationForm = ({ professionalId, onSuccess }: VerificationFormProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMethod) {
      toast.error('Please select a verification method');
      return;
    }

    setSubmitting(true);

    try {
      // Create verification request
      const { error: verificationError } = await supabase
        .from('professional_verifications' as any)
        .insert({
          professional_id: professionalId,
          verification_method: selectedMethod,
          status: 'pending',
          notes: notes || null,
        });

      if (verificationError) throw verificationError;

      // Update professional profile phase to verification_pending
      const { error: profileError } = await supabase
        .from('professional_profiles')
        .update({
          onboarding_phase: 'verification_pending',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', professionalId);

      if (profileError) throw profileError;

      toast.success('Verification request submitted successfully! We\'ll review it within 1-2 business days.');
      setSelectedMethod('');
      setNotes('');
      onSuccess?.();
    } catch (error: any) {
      console.error('Error submitting verification:', error);
      toast.error(error.message || 'Failed to submit verification request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Verification Request</CardTitle>
        <CardDescription>
          Choose a verification method and upload supporting documents
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Verification Method</Label>
            <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
              {VERIFICATION_METHODS.map((method) => {
                const Icon = method.icon;
                return (
                  <div
                    key={method.value}
                    className="flex items-start space-x-3 space-y-0 p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => setSelectedMethod(method.value)}
                  >
                    <RadioGroupItem value={method.value} id={method.value} />
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div className="space-y-1">
                        <Label htmlFor={method.value} className="cursor-pointer font-medium">
                          {method.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {method.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional information about your verification documents..."
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={submitting || !selectedMethod} className="w-full">
            {submitting ? 'Submitting...' : 'Submit Verification Request'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
