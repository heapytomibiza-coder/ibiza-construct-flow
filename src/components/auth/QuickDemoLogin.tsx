import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Briefcase, Shield, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const DEMO_ACCOUNTS = [
  {
    email: 'client.demo@platform.com',
    password: 'ClientDemo123!',
    role: 'client',
    label: 'Client Demo',
    description: 'Post jobs & hire professionals',
    icon: User,
    color: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20'
  },
  {
    email: 'pro.demo@platform.com',
    password: 'ProDemo123!',
    role: 'professional',
    label: 'Professional Demo',
    description: 'Find work & manage bookings',
    icon: Briefcase,
    color: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20'
  },
  {
    email: 'admin.demo@platform.com',
    password: 'AdminDemo123!',
    role: 'admin',
    label: 'Admin Demo',
    description: 'Manage platform & users',
    icon: Shield,
    color: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20'
  }
];

export function QuickDemoLogin() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);

  const handleDemoLogin = async (account: typeof DEMO_ACCOUNTS[0]) => {
    console.log('🔵 [QuickDemoLogin] Demo login started for:', account.email, 'role:', account.role);
    setLoading(account.email);
    
    try {
      // Sign in with demo account
      console.log('🔵 [QuickDemoLogin] Attempting sign in...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      });

      if (signInError) {
        console.error('🔴 [QuickDemoLogin] Sign in error:', signInError);
        throw signInError;
      }

      if (!signInData.user) {
        console.error('🔴 [QuickDemoLogin] No user data returned');
        throw new Error('No user data returned');
      }

      console.log('✅ [QuickDemoLogin] Sign in successful, user ID:', signInData.user.id);

      // Switch the active role in the profile
      console.log('🔵 [QuickDemoLogin] Updating active_role to:', account.role);
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ active_role: account.role })
        .eq('id', signInData.user.id);

      if (profileError) {
        console.error('🔴 [QuickDemoLogin] Profile update error:', profileError);
        throw new Error(`Failed to update active role: ${profileError.message}`);
      }

      console.log('✅ [QuickDemoLogin] Profile updated successfully');

      toast({
        title: 'Demo Login Successful',
        description: `Signed in as ${account.label}`
      });

      // Determine navigation target with priority: redirect param > auth page logic > current page reload
      const redirectParam = searchParams.get('redirect');
      const currentPath = window.location.pathname;
      
      const dashboardMap: Record<string, string> = {
        client: '/dashboard/client',
        professional: '/dashboard/pro',
        admin: '/dashboard/admin'
      };

      let targetUrl: string;

      if (redirectParam) {
        // Priority 1: Use redirect query parameter
        targetUrl = redirectParam;
        console.log('🔵 [QuickDemoLogin] Using redirect param:', targetUrl);
      } else if (currentPath === '/auth') {
        // Priority 2: If on auth page, go to role-specific dashboard
        targetUrl = dashboardMap[account.role] || '/dashboard';
        console.log('🔵 [QuickDemoLogin] On /auth, redirecting to dashboard:', targetUrl);
      } else {
        // Priority 3: Stay on current page (reload to apply role change)
        targetUrl = currentPath;
        console.log('🔵 [QuickDemoLogin] Staying on current page:', targetUrl);
      }

      console.log('✅ [QuickDemoLogin] Final navigation target:', targetUrl);
      
      // Reset loading state and navigate
      setLoading(null);
      navigate(targetUrl, { replace: true });
    } catch (error: any) {
      console.error('🔴 [QuickDemoLogin] Demo login error:', error);
      setLoading(null); // Only reset loading on error
      toast({
        title: 'Demo Login Failed',
        description: error.message || 'Failed to sign in with demo account',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-lg">Quick Demo Access</CardTitle>
        <CardDescription>
          Try the platform instantly with pre-configured demo accounts
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {DEMO_ACCOUNTS.map((account) => {
          const Icon = account.icon;
          const isLoading = loading === account.email;
          
          return (
            <Button
              key={account.email}
              variant="outline"
              className={`h-auto p-4 justify-start ${account.color}`}
              onClick={() => handleDemoLogin(account)}
              disabled={!!loading}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex-shrink-0">
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">{account.label}</div>
                  <div className="text-xs text-muted-foreground">{account.description}</div>
                </div>
              </div>
            </Button>
          );
        })}
        <p className="text-xs text-muted-foreground text-center mt-2">
          Demo accounts are pre-configured for instant access
        </p>
      </CardContent>
    </Card>
  );
}
