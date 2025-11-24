import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { useProfessionalEarnings } from '@/hooks/dashboard';
import { useAuth } from '@/hooks/useAuth';

interface EarningsData {
  period: string;
  amount: number;
  jobs: number;
}

interface EarningsChartProps {
  weeklyTarget?: number;
}

export function EarningsChart({ 
  weeklyTarget = 1000
}: EarningsChartProps) {
  const { user } = useAuth();
  const { weeklyData, totalEarnings, loading } = useProfessionalEarnings(user?.id);

  // Fallback data if loading or no data
  const defaultWeeklyData: EarningsData[] = [
    { period: 'Mon', amount: 0, jobs: 0 },
    { period: 'Tue', amount: 0, jobs: 0 },
    { period: 'Wed', amount: 0, jobs: 0 },
    { period: 'Thu', amount: 0, jobs: 0 },
    { period: 'Fri', amount: 0, jobs: 0 },
    { period: 'Sat', amount: 0, jobs: 0 },
    { period: 'Sun', amount: 0, jobs: 0 },
  ];

  const data = loading ? defaultWeeklyData : weeklyData;
  const maxAmount = Math.max(...data.map(d => d.amount), weeklyTarget);
  const weekTotal = totalEarnings;
  const targetProgress = (weekTotal / weeklyTarget) * 100;

  return (
    <Card className="overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
      
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Earnings Overview
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Track your performance and goals
            </p>
          </div>
          <Badge variant={targetProgress >= 100 ? "default" : "secondary"} className="text-xs">
            {targetProgress.toFixed(0)}% of target
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
        {/* Summary Stats - Mobile Optimized */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mx-auto mb-1 text-primary" />
            <div className="text-lg sm:text-2xl font-bold">€{weekTotal}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">This Week</div>
          </div>
          <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mx-auto mb-1 text-primary" />
            <div className="text-lg sm:text-2xl font-bold">{data.reduce((sum, d) => sum + d.jobs, 0)}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Total Jobs</div>
          </div>
          <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mx-auto mb-1 text-primary" />
            <div className="text-lg sm:text-2xl font-bold">€{(weekTotal / data.reduce((sum, d) => sum + d.jobs, 0)).toFixed(0)}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Avg/Job</div>
          </div>
        </div>

        {/* Bar Chart - Mobile Optimized */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-medium">Daily Breakdown</span>
            <span className="text-muted-foreground hidden sm:inline">Target: €{weeklyTarget}</span>
          </div>
          
          <div className="space-y-2">
            {data.map((day) => {
              const percentage = (day.amount / maxAmount) * 100;
              const isAboveAverage = day.amount > weekTotal / 7;
              
              return (
                <div key={day.period} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium w-8 sm:w-12 text-[10px] sm:text-xs">{day.period}</span>
                    <div className="flex-1 mx-2 sm:mx-3">
                      <div className="relative h-7 sm:h-8 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                            isAboveAverage 
                              ? "bg-gradient-to-r from-primary to-primary/80" 
                              : "bg-gradient-to-r from-muted-foreground/50 to-muted-foreground/30"
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-between px-2 sm:px-3">
                          <span className="text-[10px] sm:text-xs font-bold text-foreground">
                            €{day.amount}
                          </span>
                          <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">
                            {day.jobs} {day.jobs === 1 ? 'job' : 'jobs'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Target Progress */}
        <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Weekly Target Progress</span>
            <span className="text-sm font-bold">€{weekTotal} / €{weeklyTarget}</span>
          </div>
          <div className="h-3 bg-background rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
              style={{ width: `${Math.min(targetProgress, 100)}%` }}
            />
          </div>
          {targetProgress < 100 && (
            <p className="text-xs text-muted-foreground mt-2">
              €{(weeklyTarget - weekTotal).toFixed(0)} remaining to reach target
            </p>
          )}
          {targetProgress >= 100 && (
            <p className="text-xs text-primary mt-2 font-medium">
              🎉 Target achieved! €{(weekTotal - weeklyTarget).toFixed(0)} above goal
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
