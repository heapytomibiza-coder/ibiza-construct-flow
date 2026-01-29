import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Loader2, Home, Wrench, ArrowLeft, ShieldCheck, Mail, CheckCircle2 } from 'lucide-react';
import { useSignIn, useSignUp } from '../../packages/@contracts/clients';
// QuickDemoLogin removed for launch - preserved in components for future restoration
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { z } from 'zod';

const PASSWORD_MIN_LENGTH = 8;

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`),
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

  // Redirect URL for after auth
  const redirectTo = useMemo(() => searchParams.get('redirect') || '/dashboard', [searchParams]);

  // Real-time validation
  const isEmailValid = useMemo(() => {
    if (!email) return false;
    return /\S+@\S+\.\S+/.test(email);
  }, [email]);

  const isPasswordValid = useMemo(() => {
    if (!password) return false;
    return tab === 'signin' ? password.length >= 1 : password.length >= PASSWORD_MIN_LENGTH;
  }, [password, tab]);

  const canSubmit = isEmailValid && isPasswordValid && !loading;

  // Check if already authenticated and redirect away from auth page
  useEffect(() => {
    // Removed - RouteGuard should handle auth gating instead
    // This prevents unnecessary redirects from the auth page
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Almost there',
        description: 'Please enter your email and password.',
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
          description: "You're signed in. Taking you to your dashboard…"
        });
        
        // Delay to ensure session is fully propagated across all listeners
        console.log('🔵 [UnifiedAuth] Navigating to:', redirectTo);
        setTimeout(() => {
          navigate(redirectTo, { replace: true });
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
            title: 'Please check your details',
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
          description: 'Check your inbox to verify your email.'
        });
        
        navigate('/auth/verify-email');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Provide security-conscious error messages that don't leak account existence
      if (error.message?.includes('Invalid login credentials')) {
        toast({
          title: 'Sign in failed',
          description: 'Email or password incorrect. If you normally sign in with Google, use that option. Otherwise, try resetting your password.',
          variant: 'destructive'
        });
      } else if (error.message?.includes('Email not confirmed')) {
        toast({
          title: 'Email not verified',
          description: 'Please verify your email from your inbox before signing in.',
          variant: 'destructive'
        });
      } else if (error.message?.includes('User already registered')) {
        toast({
          title: 'Account already exists',
          description: 'That email is already registered. Try signing in instead.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Something went wrong',
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
                ? 'Sign in to manage jobs, messages, and your dashboard.'
                : 'Choose a role and get set up in about a minute.'}
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
                    <p className="text-xs text-muted-foreground">
                      Use the email you registered with.
                    </p>
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
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Inline validation hint */}
                  {!isEmailValid && email.length > 0 && (
                    <p className="text-xs text-destructive">
                      That email doesn't look right — try name@domain.com
                    </p>
                  )}

                  <Button type="submit" className="w-full" disabled={!canSubmit}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in…
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                  
                  {/* Subtle skip link */}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                      onClick={() => navigate(redirectTo)}
                    >
                      Continue without signing in
                    </button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Role Selection */}
                  <div className="space-y-3">
                    <Label>I want to…</Label>
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
                              Post a job and hire skilled people for your project.
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
                              Connect with clients and grow your work on the island.
                            </p>
                          </div>
                        </label>
                      </div>
                    </RadioGroup>
                    <p className="text-xs text-muted-foreground">
                      You can complete your profile details after verification.
                    </p>
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
                    <p className="text-xs text-muted-foreground">
                      Helps people recognize you. You can change this later.
                    </p>
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
                    <p className="text-xs text-muted-foreground">
                      We never share your email publicly.
                    </p>
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
                        minLength={PASSWORD_MIN_LENGTH}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      8+ characters. A passphrase works great.
                    </p>
                  </div>

                  {/* Inline validation hints */}
                  {!isEmailValid && email.length > 0 && (
                    <p className="text-xs text-destructive">
                      That email doesn't look right — try name@domain.com
                    </p>
                  )}
                  {password.length > 0 && password.length < PASSWORD_MIN_LENGTH && (
                    <p className="text-xs text-destructive">
                      Password needs {PASSWORD_MIN_LENGTH} characters (currently {password.length}).
                    </p>
                  )}

                  <Button type="submit" className="w-full" disabled={!canSubmit}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account…
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                  
                  {/* Subtle skip link */}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                      onClick={() => navigate(redirectTo)}
                    >
                      Continue without creating an account
                    </button>
                  </div>
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

        {/* Guidance Panel (Desktop) */}
        <div className="hidden lg:block">
          <Card className="h-full bg-muted/30 border-muted">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Quick, clear, and secure
              </CardTitle>
              <CardDescription>
                Everything you need to get started — without the hassle.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Trust points */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Privacy first</p>
                    <p className="text-xs text-muted-foreground">
                      Your email isn't shown publicly. You control what's visible.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Email verification</p>
                    <p className="text-xs text-muted-foreground">
                      After sign up, verify your email and you're in.
                    </p>
                  </div>
                </div>
              </div>

              {/* What happens next */}
              <div className="pt-4 border-t border-border/50">
                <p className="font-medium text-sm mb-3">What happens next</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Create your account
                  </li>
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Verify your email
                  </li>
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Set up your profile when ready
                  </li>
                </ul>
              </div>

              {/* Help */}
              <div className="pt-4 border-t border-border/50">
                <p className="font-medium text-sm mb-1">Need a hand?</p>
                <p className="text-xs text-muted-foreground">
                  If something doesn't look right, use the{' '}
                  <Link to="/contact" className="text-primary hover:underline">
                    contact page
                  </Link>{' '}
                  and we'll help you quickly.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
