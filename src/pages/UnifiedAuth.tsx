import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Loader2, Home, Wrench, ArrowLeft } from 'lucide-react';
import { useSignIn, useSignUp } from '../../packages/@contracts/clients';
import { QuickDemoLogin } from '@/components/auth/QuickDemoLogin';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(1, 'Name is required').optional(),
  role: z.union([z.literal('client'), z.literal('professional')])
});

export default function UnifiedAuth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const defaultTab = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const preSelectedRole = searchParams.get('role') as 'client' | 'professional' | null;
  
  const [tab, setTab] = useState<'signin' | 'signup'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'client' | 'professional'>(preSelectedRole || 'client');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();

  // Check if already authenticated and redirect away from auth page
  useEffect(() => {
    // Removed - RouteGuard should handle auth gating instead
    // This prevents unnecessary redirects from the auth page
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      if (tab === 'signin') {
        console.log('🔵 [UnifiedAuth] Starting sign in...');
        await signInMutation.mutateAsync({
          email,
          password
        });

        console.log('🔵 [UnifiedAuth] Sign in mutation complete, verifying session...');
        
        // Retry mechanism: Wait for session to be confirmed
        let sessionConfirmed = false;
        for (let i = 0; i < 3; i++) {
          await new Promise(resolve => setTimeout(resolve, 150));
          const { data: { session } } = await supabase.auth.getSession();
          console.log(`🔵 [UnifiedAuth] Session check attempt ${i + 1}:`, !!session);
          
          if (session) {
            sessionConfirmed = true;
            break;
          }
        }
        
        if (!sessionConfirmed) {
          throw new Error('Failed to establish session');
        }

        console.log('🔵 [UnifiedAuth] ✅ Session confirmed, showing toast');
        toast({
          title: 'Welcome back!',
          description: 'Successfully signed in'
        });
        
        // Respect redirect parameter from URL
        const redirectTo = searchParams.get('redirect');
        
        // Delay to ensure session is fully propagated across all listeners
        console.log('🔵 [UnifiedAuth] Navigating to:', redirectTo || '/dashboard');
        setTimeout(() => {
          navigate(redirectTo || '/dashboard', { replace: true });
        }, 250);
      } else {
        // Validate signup data
        const validationResult = signupSchema.safeParse({ 
          email, 
          password, 
          fullName, 
          role 
        });

        if (!validationResult.success) {
          const firstError = validationResult.error.issues[0];
          toast({
            title: 'Validation Error',
            description: firstError.message,
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }

        const redirectUrl = `${window.location.origin}/`;
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName || email.split('@')[0],
              intent_role: role
            }
          }
        });

        if (error) throw error;

        // Store email for resend functionality
        localStorage.setItem('pending_verification_email', email);

        toast({
          title: 'Account created!',
          description: 'Check your email to verify your account'
        });
        
        navigate('/auth/verify-email');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Provide security-conscious error messages that don't leak account existence
      if (error.message?.includes('Invalid login credentials')) {
        toast({
          title: 'Sign in failed',
          description: 'Email or password incorrect. If you normally sign in with Google, use "Continue with Google". Otherwise, try resetting your password.',
          variant: 'destructive'
        });
      } else if (error.message?.includes('Email not confirmed')) {
        toast({
          title: 'Email not verified',
          description: 'Please check your inbox and verify your email before signing in.',
          variant: 'destructive'
        });
      } else if (error.message?.includes('User already registered')) {
        toast({
          title: 'Account exists',
          description: 'An account with this email already exists. Try signing in instead.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Authentication failed',
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-[1fr,400px] gap-6">
        {/* Main Auth Card */}
        <Card>
          <CardHeader>
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Link>
            <CardTitle className="text-2xl">
              {tab === 'signin' ? 'Welcome back' : 'Create your account'}
            </CardTitle>
            <CardDescription>
              {tab === 'signin' 
                ? 'Sign in to continue to your dashboard'
                : 'Choose your role and create an account to get started'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={tab} onValueChange={(v) => setTab(v as 'signin' | 'signup')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link to="/auth/forgot-password" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => {
                      const redirectTo = searchParams.get('redirect');
                      navigate(redirectTo || '/dashboard');
                    }}
                  >
                    Skip for now
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Role Selection */}
                  <div className="space-y-3">
                    <Label>I want to...</Label>
                    <RadioGroup value={role} onValueChange={(v) => setRole(v as 'client' | 'professional')}>
                      <div className="grid gap-3">
                        <label
                          htmlFor="role-client"
                          className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            role === 'client' 
                              ? 'border-primary bg-primary/5' 
                              : 'border-muted hover:border-muted-foreground/50'
                          }`}
                        >
                          <RadioGroupItem value="client" id="role-client" className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Home className="w-4 h-4" />
                              <span className="font-semibold">Find professionals</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Post jobs and hire skilled professionals for your projects
                            </p>
                          </div>
                        </label>

                        <label
                          htmlFor="role-professional"
                          className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            role === 'professional' 
                              ? 'border-primary bg-primary/5' 
                              : 'border-muted hover:border-muted-foreground/50'
                          }`}
                        >
                          <RadioGroupItem value="professional" id="role-professional" className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Wrench className="w-4 h-4" />
                              <span className="font-semibold">Offer my services</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Connect with clients and grow your business
                            </p>
                          </div>
                        </label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a secure password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Must be at least 6 characters
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => {
                      const redirectTo = searchParams.get('redirect');
                      navigate(redirectTo || '/dashboard');
                    }}
                  >
                    Skip for now
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <div className="text-center text-sm text-muted-foreground">
              {tab === 'signin' ? (
                <>
                  Don't have an account?{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-semibold"
                    onClick={() => setTab('signup')}
                  >
                    Sign up
                  </Button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-semibold"
                    onClick={() => setTab('signin')}
                  >
                    Sign in
                  </Button>
                </>
              )}
            </div>
          </CardFooter>
        </Card>

        {/* Quick Demo Login Sidebar */}
        <div className="hidden lg:block">
          <QuickDemoLogin />
        </div>

        {/* Mobile Demo Login */}
        <div className="lg:hidden">
          <QuickDemoLogin />
        </div>
      </div>
    </div>
  );
}
