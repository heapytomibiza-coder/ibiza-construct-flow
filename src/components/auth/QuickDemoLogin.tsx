import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Briefcase, Shield, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DEMO_ACCOUNTS = [
  {
    email: 'demo-client@test.com',
    password: 'demo123',
    role: 'client',
    label: 'Client Demo',
    description: 'Post jobs & hire professionals',
    icon: User,
    color: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20'
  },
  {
    email: 'demo-pro@test.com',
    password: 'demo123',
    role: 'professional',
    label: 'Professional Demo',
    description: 'Find work & manage bookings',
    icon: Briefcase,
    color: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20'
  },
  {
    email: 'demo-admin@test.com',
    password: 'demo123',
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
  const [loading, setLoading] = useState<string | null>(null);

  const handleDemoLogin = async (account: typeof DEMO_ACCOUNTS[0]) => {
    setLoading(account.email);
    
    try {
      // Sign in with demo account
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      });

      if (signInError) {
        throw signInError;
      }

      if (!signInData.user) {
        throw new Error('No user data returned');
      }

      // Ensure the user has the correct role in user_roles table
      await supabase
        .from('user_roles')
        .upsert(
          { 
            user_id: signInData.user.id, 
            role: account.role as 'client' | 'professional' | 'admin'
          },
          { 
            onConflict: 'user_id,role'
          }
        );

      // Update profile active_role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ active_role: account.role })
        .eq('id', signInData.user.id);

      if (profileError) {
        console.warn('Profile update warning:', profileError);
      }

      toast({
        title: 'Demo Login Successful',
        description: `Signed in as ${account.label}`
      });

      // Navigate based on role
      const dashboardMap: Record<string, string> = {
        client: '/dashboard/client',
        professional: '/dashboard/pro',
        admin: '/dashboard/admin'
      };
      
      // Small delay to ensure auth state is updated
      setTimeout(() => {
        navigate(dashboardMap[account.role] || '/dashboard');
      }, 500);
    } catch (error: any) {
      console.error('Demo login error:', error);
      toast({
        title: 'Demo Login Failed',
        description: error.message || 'Failed to sign in with demo account',
        variant: 'destructive'
      });
    } finally {
      setLoading(null);
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
          All demo accounts use password: <code className="bg-muted px-1 rounded">demo123</code>
        </p>
      </CardContent>
    </Card>
  );
}
