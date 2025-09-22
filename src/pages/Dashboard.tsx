import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Database, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth');
        return;
      }
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been signed out successfully.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {user.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">Authenticated</Badge>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/10 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <Database className="w-5 h-5" />
              Database Migration Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-orange-800 dark:text-orange-200 mb-2">
                  Your authentication is working, but the database schema needs to be applied first.
                </p>
                <div className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                  <p>✅ Authentication system: Active</p>
                  <p>✅ Role-based routing: Ready</p>
                  <p>⏳ Database schema: Pending migration</p>
                  <p>⏳ User profiles: Waiting for tables</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
              <p className="text-sm font-medium mb-2">Next Steps:</p>
              <ol className="text-sm space-y-1 text-muted-foreground">
                <li>1. Run the database migration that was created</li>
                <li>2. The profile system will activate automatically</li>
                <li>3. Role-based dashboards will become available</li>
                <li>4. Phase 1 features can then be implemented</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;