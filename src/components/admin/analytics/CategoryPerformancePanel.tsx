import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from '@/integrations/supabase/types';
import { Progress } from '@/components/ui/progress';

type CategoryAnalytics = Database['public']['Tables']['category_analytics']['Row'];

interface CategoryPerformancePanelProps {
  analytics: CategoryAnalytics[];
}

export function CategoryPerformancePanel({ analytics }: CategoryPerformancePanelProps) {
  // Group by category and aggregate
  const categoryGroups = analytics.reduce((acc, item) => {
    const key = item.category_id;
    if (!acc[key]) {
      acc[key] = {
        categoryId: key,
        totalJobs: 0,
        completedJobs: 0,
        totalRevenue: 0,
        avgRating: 0,
        count: 0,
      };
    }
    acc[key].totalJobs += item.total_jobs || 0;
    acc[key].completedJobs += item.completed_jobs || 0;
    acc[key].totalRevenue += item.total_revenue || 0;
    acc[key].avgRating += item.avg_rating || 0;
    acc[key].count += 1;
    return acc;
  }, {} as Record<string, any>);

  const categoryStats = Object.values(categoryGroups)
    .map((group: any) => ({
      ...group,
      avgRating: group.count > 0 ? group.avgRating / group.count : 0,
      completionRate:
        group.totalJobs > 0 ? (group.completedJobs / group.totalJobs) * 100 : 0,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  return (
    <div className="space-y-4">
      {categoryStats.map((category, index) => (
        <Card key={category.categoryId}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Category #{index + 1}</CardTitle>
              <span className="text-sm text-muted-foreground">
                €{category.totalRevenue.toLocaleString()}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>Completion Rate</span>
                <span>{category.completionRate.toFixed(1)}%</span>
              </div>
              <Progress value={category.completionRate} className="h-2" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Total Jobs: {category.totalJobs}</span>
              <span>Avg Rating: {category.avgRating.toFixed(2)}⭐</span>
            </div>
          </CardContent>
        </Card>
      ))}
      {categoryStats.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">No category data available</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}