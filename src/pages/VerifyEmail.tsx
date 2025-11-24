import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2 } from 'lucide-react';
import { getAuthRoute } from '@/lib/navigation';
import { supabase } from '@/integrations/supabase/client';

export default function VerifyEmail() {
  const { toast } = useToast();
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const handleResendEmail = async () => {
    if (cooldown) {
      toast({
        title: 'Please wait',
        description: 'You can request a new email in a moment',
        variant: 'destructive'
      });
      return;
    }

    setResending(true);
    
    try {
      // Get the email from localStorage if available
      const email = localStorage.getItem('pending_verification_email');
      
      if (!email) {
        toast({
          title: 'Email not found',
          description: 'Please return to sign up and try again',
          variant: 'destructive'
        });
        return;
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;

      toast({
        title: 'Email sent!',
        description: 'Check your inbox for the verification link'
      });

      // Set cooldown for 60 seconds
      setCooldown(true);
      setTimeout(() => setCooldown(false), 60000);
      
    } catch (error: any) {
      console.error('Resend error:', error);
      toast({
        title: 'Failed to resend',
        description: error.message || 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We've sent you a secure link to complete your sign up
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Click the link in your email to verify your account and continue. 
                The link will expire in 15 minutes for security.
              </p>
              
              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <p className="text-sm text-muted-foreground">
                  <strong>Didn't receive the email?</strong>
                  <br />
                  • Check your spam folder
                  <br />
                  • Make sure the email address is correct
                  <br />
                  • Click the button below to resend
                </p>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={handleResendEmail}
                  disabled={resending || cooldown}
                  className="w-full"
                >
                  {resending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </Button>

                <Button 
                  onClick={() => window.location.href = getAuthRoute('signin')} 
                  variant="outline"
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}