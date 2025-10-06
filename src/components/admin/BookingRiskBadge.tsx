import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BookingRiskBadgeProps {
  bookingId: string;
}

export function BookingRiskBadge({ bookingId }: BookingRiskBadgeProps) {
  const { data: riskFlags } = useQuery({
    queryKey: ["booking-risk-flags", bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_risk_flags" as any)
        .select("*")
        .eq("booking_id", bookingId)
        .is("resolved_at", null)
        .order("severity", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Array<{
        id: string;
        risk_type: string;
        severity: "low" | "medium" | "high" | "critical";
        message: string;
      }>;
    },
  });

  if (!riskFlags || riskFlags.length === 0) return null;

  const highestSeverity = riskFlags[0]?.severity || "low";
  const riskCount = riskFlags.length;

  const severityConfig = {
    critical: {
      variant: "destructive" as const,
      icon: AlertTriangle,
      color: "text-destructive",
    },
    high: {
      variant: "destructive" as const,
      icon: AlertCircle,
      color: "text-destructive",
    },
    medium: {
      variant: "secondary" as const,
      icon: AlertCircle,
      color: "text-warning",
    },
    low: {
      variant: "outline" as const,
      icon: Info,
      color: "text-muted-foreground",
    },
  };

  const config = severityConfig[highestSeverity as keyof typeof severityConfig];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={config.variant} className="gap-1">
            <Icon className="h-3 w-3" />
            {riskCount} Risk{riskCount > 1 ? "s" : ""}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            {riskFlags.map((flag: any) => (
              <div key={flag.id} className="text-sm">
                <span className="font-medium">{flag.risk_type}:</span>{" "}
                {flag.message}
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
