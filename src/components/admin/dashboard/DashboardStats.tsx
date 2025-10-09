import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, FileText, TrendingUp } from "lucide-react";

export function DashboardStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const [usersCount, jobsCount, reviewsCount, professionalCount] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("jobs").select("id", { count: "exact", head: true }),
        supabase.from("reviews").select("id", { count: "exact", head: true }),
        supabase.from("professional_profiles").select("id", { count: "exact", head: true }),
      ]);

      return {
        totalUsers: usersCount.count || 0,
        totalJobs: jobsCount.count || 0,
        totalReviews: reviewsCount.count || 0,
        totalProfessionals: professionalCount.count || 0,
      };
    },
  });

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      description: "Registered users",
    },
    {
      title: "Total Jobs",
      value: stats?.totalJobs || 0,
      icon: Briefcase,
      description: "All time jobs",
    },
    {
      title: "Professionals",
      value: stats?.totalProfessionals || 0,
      icon: TrendingUp,
      description: "Active professionals",
    },
    {
      title: "Reviews",
      value: stats?.totalReviews || 0,
      icon: FileText,
      description: "Total reviews",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stat.value.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
