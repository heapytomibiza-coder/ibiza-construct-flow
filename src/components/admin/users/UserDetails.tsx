import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Mail, Calendar, Shield, UserX, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type User = {
  id: string;
  email: string;
  full_name: string | null;
  roles: string[];
  created_at: string;
  is_suspended?: boolean;
};

interface UserDetailsProps {
  user: User;
  onUpdate: () => void;
}

export function UserDetails({ user, onUpdate }: UserDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const { toast } = useToast();

  const handleSuspend = async () => {
    setIsUpdating(true);
    try {
      await supabase.auth.admin.updateUserById(user.id, {
        ban_duration: "876000h",
      });
      
      toast({
        title: "User suspended",
        description: "User has been suspended successfully",
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to suspend user",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleActivate = async () => {
    setIsUpdating(true);
    try {
      await supabase.auth.admin.updateUserById(user.id, {
        ban_duration: "none",
      });
      
      toast({
        title: "User activated",
        description: "User has been activated successfully",
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate user",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddRole = async () => {
    if (!selectedRole) return;
    
    setIsUpdating(true);
    try {
      // Insert into user_roles table
      const { error } = await supabase.from("user_roles").insert({
        user_id: user.id,
        role: selectedRole as "admin" | "client" | "professional",
      });

      if (error) throw error;
      
      toast({
        title: "Role added",
        description: `${selectedRole} role has been added`,
      });
      setSelectedRole("");
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add role",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveRole = async (role: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", user.id)
        .eq("role", role as "admin" | "client" | "professional");

      if (error) throw error;
      
      toast({
        title: "Role removed",
        description: `${role} role has been removed`,
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove role",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* User Info */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{user.full_name || "N/A"}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Mail className="h-4 w-4" />
            {user.email}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={user.is_suspended ? "destructive" : "outline"}>
            {user.is_suspended ? "Suspended" : "Active"}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Roles */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <h4 className="font-medium">Roles</h4>
        </div>

        <div className="flex gap-2 flex-wrap">
          {user.roles?.length > 0 ? (
            user.roles.map(role => (
              <Badge key={role} variant="secondary" className="gap-2">
                {role}
                <button
                  onClick={() => handleRemoveRole(role)}
                  className="hover:text-destructive"
                  disabled={isUpdating}
                >
                  ×
                </button>
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No roles assigned</p>
          )}
        </div>

        <div className="flex gap-2">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select role to add" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddRole}
            disabled={!selectedRole || isUpdating}
            size="sm"
          >
            Add Role
          </Button>
        </div>
      </div>

      <Separator />

      {/* Metadata */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Joined:</span>
          <span>{format(new Date(user.created_at), "PPP")}</span>
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="space-y-2">
        {user.is_suspended ? (
          <Button
            onClick={handleActivate}
            disabled={isUpdating}
            className="w-full"
            variant="outline"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Activate User
          </Button>
        ) : (
          <Button
            onClick={handleSuspend}
            disabled={isUpdating}
            className="w-full"
            variant="destructive"
          >
            <UserX className="h-4 w-4 mr-2" />
            Suspend User
          </Button>
        )}
      </div>
    </div>
  );
}
