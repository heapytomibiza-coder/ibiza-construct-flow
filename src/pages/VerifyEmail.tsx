import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, RefreshCw } from 'lucide-react';

export default function VerifyEmail() {
  const [resending, setResending] = useState(false);
  const { toast } = useToast();

  const handleResend = async () => {
    setResending(true);
    try {
      // This would need the user's email from local storage or similar
      toast({
        title: 'Resend functionality',
        description: 'Please go back to sign up/sign in to resend the email.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
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
                  • Try resending the link
                </p>
              </div>

              <Button 
                onClick={handleResend} 
                variant="outline" 
                disabled={resending}
                className="w-full"
              >
                {resending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Resending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Resend email
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}