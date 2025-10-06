import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getAuthRoute } from '@/lib/navigation';

export default function QuickStart() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');

  const role = searchParams.get('role') as 'client' | 'professional' || 'client';

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate(getAuthRoute('signin'));
          return;
        }

        // Prefill display name from user metadata or email
        const prefillName = user.user_metadata?.full_name || 
                           user.email?.split('@')[0] || '';
        setDisplayName(prefillName);
      } catch (error) {
        console.error('Error initializing user:', error);
      }
    };

    initializeUser();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Upsert profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // If professional, redirect to full onboarding
      if (role === 'professional') {
        navigate('/onboarding/professional');
        return;
      }

      // Client flow - redirect to dashboard
      toast({
        title: 'Profile completed!',
        description: 'You can now start posting projects.',
      });

      navigate('/dashboard/client');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {role === 'client' ? 'Complete your profile' : 'Set up your professional profile'}
            </CardTitle>
            <p className="text-muted-foreground">
              {role === 'client' ? 
                'Just a few quick details to get you started' : 
                'Tell us about your services - takes less than a minute'
              }
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should we display your name?"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !displayName}
              >
                {loading ? 'Setting up...' : 
                 role === 'client' ? 'Start Finding Professionals' : 'Continue to Setup'
                }
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}