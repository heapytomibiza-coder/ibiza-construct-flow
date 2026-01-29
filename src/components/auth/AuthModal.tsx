import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useSignIn, useSignUp } from '../../../packages/@contracts/clients';
import { enableProfessionalRole } from '@/lib/roles';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup';
}

export default function AuthModal({ open, onClose, defaultTab = 'signin' }: AuthModalProps) {
  const [tab, setTab] = useState<'signin' | 'signup'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [signUpAsProfessional, setSignUpAsProfessional] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();

  async function handleMagicLink() {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { 
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    setLoading(false);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Check your email",
        description: "We've sent you a magic link to sign in"
      });
      onClose();
    }
  }

  async function handlePasswordAuth() {
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (tab === 'signup') {
      signUpMutation.mutate(
        { email, password, fullName },
        {
          onSuccess: (data) => {
            if (signUpAsProfessional) {
              setTimeout(async () => {
                try {
                  await enableProfessionalRole();
                } catch (err) {
                  console.error('Error enabling professional role:', err);
                }
              }, 1000);
            }
            
            toast({
              title: "Account created",
              description: "Please check your email to confirm your account"
            });
            onClose();
          },
          onError: (error: any) => {
            toast({
              title: "Sign up failed",
              description: error.message,
              variant: "destructive"
            });
          }
        }
      );
    } else {
      signInMutation.mutate(
        { email, password },
        {
          onSuccess: () => {
            toast({
              title: "Welcome back",
              description: "You've been signed in successfully"
            });
            onClose();
          },
          onError: (error: any) => {
            toast({
              title: "Sign in failed",
              description: error.message,
              variant: "destructive"
            });
          }
        }
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to our platform</DialogTitle>
        </DialogHeader>
        
        <Tabs value={tab} onValueChange={(value) => setTab(value as 'signin' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handleMagicLink} 
                variant="outline" 
                className="w-full"
                disabled={loading}
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Magic Link
              </Button>
              <Button 
                onClick={handlePasswordAuth} 
                className="w-full"
                disabled={signInMutation.isPending}
              >
                Sign In
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name">Full Name</Label>
              <Input
                id="signup-name"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="professional"
                checked={signUpAsProfessional}
                onCheckedChange={(checked) => setSignUpAsProfessional(checked as boolean)}
              />
              <Label htmlFor="professional" className="text-sm">
                I want to offer services as a professional
              </Label>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handleMagicLink} 
                variant="outline" 
                className="w-full"
                disabled={loading}
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Magic Link
              </Button>
              <Button 
                onClick={handlePasswordAuth} 
                className="w-full"
                disabled={signUpMutation.isPending}
              >
                Create Account
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}