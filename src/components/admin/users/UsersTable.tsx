import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminQueue } from "@/components/admin/shared/AdminQueue";
import { AdminDrawer } from "@/components/admin/shared/AdminDrawer";
import { UserDetails } from "./UserDetails";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserX, UserCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type User = {
  id: string;
  email: string;
  full_name: string | null;
  roles: string[];
  created_at: string;
  is_suspended?: boolean;
};

export function UsersTable() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const { toast } = useToast();

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["admin-users", statusFilter, roleFilter],
    queryFn: async () => {
      // Get profiles with their roles
      const { data: profiles } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          created_at
        `)
        .order("created_at", { ascending: false });

      if (!profiles) return [];

      // Get roles for each user
      const { data: userRoles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      // Get email from auth.users
      const { data: authData } = await supabase.auth.admin.listUsers();
      
      const usersWithEmail = profiles.map(profile => {
        const authUser: any = authData?.users.find((u: any) => u.id === profile.id);
        const roles = userRoles?.filter((r: any) => r.user_id === profile.id).map((r: any) => r.role) || [];
        
        return {
          ...profile,
          email: authUser?.email || "N/A",
          roles,
          is_suspended: authUser?.banned_until ? new Date(authUser.banned_until) > new Date() : false,
        };
      });

      // Apply filters
      let filtered = usersWithEmail;

      if (statusFilter === "active") {
        filtered = filtered.filter(u => !u.is_suspended);
      } else if (statusFilter === "suspended") {
        filtered = filtered.filter(u => u.is_suspended);
      }

      if (roleFilter !== "all") {
        filtered = filtered.filter(u => u.roles.includes(roleFilter as any));
      }

      return filtered;
    },
  });

  const handleSuspendUser = async (userId: string) => {
    try {
      await supabase.auth.admin.updateUserById(userId, {
        ban_duration: "876000h", // ~100 years
      });
      
      toast({
        title: "User suspended",
        description: "User has been suspended successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to suspend user",
        variant: "destructive",
      });
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      await supabase.auth.admin.updateUserById(userId, {
        ban_duration: "none",
      });
      
      toast({
        title: "User activated",
        description: "User has been activated successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate user",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const filters = [
    { id: "all", label: "All Users", count: users?.length || 0 },
    { id: "active", label: "Active", count: users?.filter(u => !u.is_suspended).length || 0 },
    { id: "suspended", label: "Suspended", count: users?.filter(u => u.is_suspended).length || 0 },
  ];

  const columns = [
    {
      key: "full_name",
      label: "Name",
      render: (user: User) => (
        <div>
          <p className="font-medium">{user.full_name || "N/A"}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      ),
    },
    {
      key: "roles",
      label: "Roles",
      render: (user: User) => (
        <div className="flex gap-1 flex-wrap">
          {user.roles?.length > 0 ? (
            user.roles.map(role => (
              <Badge key={role} variant="outline">
                {role}
              </Badge>
            ))
          ) : (
            <Badge variant="outline">No roles</Badge>
          )}
        </div>
      ),
    },
    {
      key: "created_at",
      label: "Joined",
      render: (user: User) => format(new Date(user.created_at), "MMM d, yyyy"),
    },
    {
      key: "status",
      label: "Status",
      render: (user: User) => (
        <Badge variant={user.is_suspended ? "destructive" : "outline"}>
          {user.is_suspended ? "Suspended" : "Active"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (user: User) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewDetails(user)}>
              View Details
            </DropdownMenuItem>
            {user.is_suspended ? (
              <DropdownMenuItem onClick={() => handleActivateUser(user.id)}>
                <UserCheck className="h-4 w-4 mr-2" />
                Activate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => handleSuspendUser(user.id)}>
                <UserX className="h-4 w-4 mr-2" />
                Suspend
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <AdminQueue
        title="User Management"
        description="Manage user accounts and permissions"
        data={users || []}
        columns={columns}
        isLoading={isLoading}
        filters={filters}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        onRowClick={handleViewDetails}
        emptyMessage="No users found"
      />

      <AdminDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="User Details"
        description="View and manage user information"
      >
        {selectedUser && <UserDetails user={selectedUser} onUpdate={refetch} />}
      </AdminDrawer>
    </>
  );
}
