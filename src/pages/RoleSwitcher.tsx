import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Home, Wrench } from 'lucide-react';

export default function RoleSwitcher() {
  const navigate = useNavigate();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRoles = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth/sign-in');
          return;
        }

        // Get roles from user_roles table
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (rolesData) {
          const roles = rolesData.map(r => r.role);
          setUserRoles(roles);
          
          // If user only has one role, redirect directly
          if (roles.length === 1) {
            if (roles.includes('professional')) {
              navigate('/dashboard/pro');
            } else {
              navigate('/dashboard/client');
            }
          }
        }
      } catch (error) {
        console.error('Error checking user roles:', error);
        navigate('/auth/sign-in');
      } finally {
        setLoading(false);
      }
    };

    checkUserRoles();
  }, [navigate]);

  const handleRoleSelect = (role: 'client' | 'professional') => {
    if (role === 'professional') {
      navigate('/dashboard/pro');
    } else {
      navigate('/dashboard/client');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (userRoles.length < 2) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              You don't have multiple roles to switch between.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Choose Your Role
          </h1>
          <p className="text-xl text-muted-foreground">
            You have access to both client and professional features
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Client Card */}
          {userRoles.includes('client') && (
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Home className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Continue as Client</CardTitle>
                <CardDescription className="text-lg">
                  Manage your projects and find professionals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6 text-center">
                  Post projects, review proposals, and manage ongoing work with your trusted professionals.
                </p>
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => handleRoleSelect('client')}
                >
                  Client Dashboard
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Professional Card */}
          {userRoles.includes('professional') && (
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Wrench className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Continue as Professional</CardTitle>
                <CardDescription className="text-lg">
                  Find opportunities and grow your business
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6 text-center">
                  Browse available projects, submit proposals, and manage your professional services.
                </p>
                <Button 
                  size="lg" 
                  className="w-full" 
                  variant="secondary"
                  onClick={() => handleRoleSelect('professional')}
                >
                  Professional Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}