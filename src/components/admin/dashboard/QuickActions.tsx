import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Briefcase, FileCheck, AlertTriangle, BarChart3, Settings, Calendar } from "lucide-react";

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Manage Users",
      icon: Users,
      onClick: () => navigate("/admin/users"),
    },
    {
      label: "View Jobs",
      icon: Briefcase,
      onClick: () => navigate("/admin/jobs"),
    },
    {
      label: "View Bookings",
      icon: Calendar,
      onClick: () => navigate("/admin/bookings"),
    },
    {
      label: "Profiles Queue",
      icon: FileCheck,
      onClick: () => navigate("/admin/profiles"),
    },
    {
      label: "Review Disputes",
      icon: AlertTriangle,
      onClick: () => navigate("/admin/disputes"),
    },
    {
      label: "Analytics",
      icon: BarChart3,
      onClick: () => navigate("/admin/analytics"),
    },
    {
      label: "Settings",
      icon: Settings,
      onClick: () => navigate("/admin/settings"),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto flex flex-col items-center gap-2 py-4"
              onClick={action.onClick}
            >
              <action.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
