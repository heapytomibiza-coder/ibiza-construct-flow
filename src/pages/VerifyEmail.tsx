import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';
import { getAuthRoute } from '@/lib/navigation';

export default function VerifyEmail() {
  const { toast } = useToast();

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
                  • Return to sign in to request a new link
                </p>
              </div>

              <Button 
                onClick={() => window.location.href = getAuthRoute('signin')} 
                variant="outline"
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}