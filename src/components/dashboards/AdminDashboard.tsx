import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DatabaseStats from '@/components/admin/DatabaseStats';
import FeatureFlagsManager from '@/components/admin/FeatureFlagsManager';
import UserInspector from '@/components/admin/UserInspector';

interface Profile {
  id: string;
  full_name: string | null;
  display_name: string | null;
  roles: any;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

interface AdminDashboardProps {
  user: User;
  profile: Profile;
}

const AdminDashboard = ({ user, profile }: AdminDashboardProps) => {
  const { toast } = useToast();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out", 
      description: "You've been signed out successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Platform Administration - {profile.full_name || user.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="destructive">Admin</Badge>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Database Stats Overview */}
        <DatabaseStats />

        {/* Feature Flags and User Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FeatureFlagsManager />
          <UserInspector />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;