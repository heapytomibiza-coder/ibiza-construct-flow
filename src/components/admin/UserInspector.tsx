import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Users, Shield } from 'lucide-react';
import { api } from '@/lib/api';
import type { UserProfile } from '../../../contracts/src/user-inspector.zod';

const UserInspector = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await api.userInspector.listUsers({ limit: 100 });
        
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to load users');
        }
        
        setUsers(response.data);
      } catch (error) {
        console.error('Error loading users:', error);
        toast({
          title: "Error",
          description: "Failed to load user profiles",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [toast]);

  const promoteToAdmin = async (userId: string, currentRoles: string[]) => {
    try {
      let updatedRoles = [...currentRoles];
      if (!updatedRoles.includes('admin')) {
        updatedRoles.push('admin');
      }

      const response = await api.userInspector.updateUserStatus({
        userId,
        roles: updatedRoles,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update user');
      }

      toast({
        title: "User Promoted",
        description: "User has been granted admin privileges",
      });

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? response.data! : user
      ));
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({
        title: "Error",
        description: "Failed to promote user to admin",
        variant: "destructive",
      });
    }
  };

  const getRoleBadges = (roles: string[]) => {
    return roles.map(role => {
      const variant = role === 'admin' ? 'destructive' : 
                     role === 'professional' ? 'default' : 'secondary';
      return (
        <Badge key={role} variant={variant} className="mr-1">
          {role}
        </Badge>
      );
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Inspector
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          User Inspector
          <Badge variant="outline" className="ml-auto">
            {users.length} Users
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.full_name || 'Unnamed User'}
                  </TableCell>
                  <TableCell>
                    {getRoleBadges(user.roles)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {!user.roles.includes('admin') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => promoteToAdmin(user.id, user.roles)}
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          Make Admin
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserInspector;