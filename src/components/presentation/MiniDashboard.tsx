import { Card } from "@/components/ui/card";
import { TrendingUp, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface MiniDashboardProps {
  type?: "client" | "professional";
}

export const MiniDashboard = ({ type = "client" }: MiniDashboardProps) => {
  if (type === "professional") {
    return (
      <Card className="p-6 space-y-4 bg-card border-sage-muted/30">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-copper/10">
            <div className="text-2xl font-bold text-copper">€8.4K</div>
            <div className="text-xs text-muted-foreground">This Month</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-sage/10">
            <div className="text-2xl font-bold text-sage">12</div>
            <div className="text-xs text-muted-foreground">Active Jobs</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-copper/10">
            <div className="text-2xl font-bold text-copper">4.9★</div>
            <div className="text-xs text-muted-foreground">Rating</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded bg-muted/50 text-xs">
            <span>New quote request</span>
            <span className="text-muted-foreground">2h ago</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-muted/50 text-xs">
            <span>Payment received</span>
            <span className="text-muted-foreground">5h ago</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4 bg-card border-sage-muted/30">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-sage/10">
          <CheckCircle className="h-8 w-8 text-sage flex-shrink-0" />
          <div>
            <div className="text-xl font-bold">3</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-copper/10">
          <Clock className="h-8 w-8 text-copper flex-shrink-0" />
          <div>
            <div className="text-xl font-bold">2</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-start gap-2 p-2 rounded bg-muted/50">
          <TrendingUp className="h-4 w-4 text-copper mt-0.5" />
          <div className="text-xs">
            <div className="font-medium">Villa Renovation</div>
            <div className="text-muted-foreground">5 quotes received</div>
          </div>
        </div>
        <div className="flex items-start gap-2 p-2 rounded bg-muted/50">
          <AlertCircle className="h-4 w-4 text-sage mt-0.5" />
          <div className="text-xs">
            <div className="font-medium">Pool Maintenance</div>
            <div className="text-muted-foreground">Scheduled tomorrow</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
