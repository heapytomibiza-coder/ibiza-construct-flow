import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Mail, Lock } from 'lucide-react';

export default function AccountSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new !== passwordData.confirm) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.new.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Password updated successfully',
      });
      
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Address</CardTitle>
          <CardDescription>
            Your email address is used for login and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{user?.email}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Contact support to change your email address
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-password"
                  type="password"
                  className="pl-10"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                  placeholder="Enter new password"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type="password"
                  className="pl-10"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
