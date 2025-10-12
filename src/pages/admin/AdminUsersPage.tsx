import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Mail, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch roles separately for each user
      const usersWithRoles = await Promise.all(
        (data || []).map(async (user) => {
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);
          
          return { ...user, roles: roles || [] };
        })
      );
      
      return usersWithRoles;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage platform users and their roles</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading users...</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {users?.map((user) => (
            <Card key={user.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold">
                      {(user.full_name || user.display_name || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{user.full_name || user.display_name || 'Unknown User'}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {user.id}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {(user as any).roles?.map((role: any) => (
                    <Badge key={role.role} variant="secondary">
                      <Shield className="h-3 w-3 mr-1" />
                      {role.role}
                    </Badge>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => navigate(`/admin/users/${user.id}`)}>
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
