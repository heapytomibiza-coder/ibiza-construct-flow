import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Users, Shield } from 'lucide-react';
import { useListUsers } from '../../../packages/@contracts/clients/user-inspector';
import { useAdminRoleManagement } from '@/hooks/useAdminRoleManagement';

const UserInspector = () => {
  const { toast } = useToast();
  
  // Use contract-generated React Query hooks
  const { data: usersData, isLoading: loading } = useListUsers({ limit: 100 });
  const { assignRole, isLoading: isAssigning } = useAdminRoleManagement();

  const users = usersData || [];

  const promoteToAdmin = async (userId: string, currentRoles: Array<'client' | 'professional' | 'admin'>) => {
    if (!currentRoles.includes('admin')) {
      try {
        await assignRole(userId, 'admin');
      } catch (error) {
        console.error('Error promoting user:', error);
      }
    }
  };

  const getRoleBadges = (roles: Array<'client' | 'professional' | 'admin'>) => {
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
                <TableRow key={user.user_id}>
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
                          onClick={() => promoteToAdmin(user.user_id, user.roles)}
                          disabled={isAssigning}
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          {isAssigning ? "Processing..." : "Make Admin"}
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