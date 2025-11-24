import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, Eye, TrendingUp, User } from 'lucide-react';

export function ProfessionalStatsCards() {
  // These should come from actual data/API
  const stats = {
    availableJobs: 24,
    interested: 8,
    thisMonth: 3240,
    profileCompletion: 85
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <Briefcase className="w-8 h-8 text-copper mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{stats.availableJobs}</div>
          <p className="text-xs text-muted-foreground">Available Jobs</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <Eye className="w-8 h-8 text-copper mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{stats.interested}</div>
          <p className="text-xs text-muted-foreground">Interested</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <TrendingUp className="w-8 h-8 text-copper mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">€{stats.thisMonth}</div>
          <p className="text-xs text-muted-foreground">This Month</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <User className="w-8 h-8 text-copper mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{stats.profileCompletion}%</div>
          <p className="text-xs text-muted-foreground">Profile</p>
        </CardContent>
      </Card>
    </div>
  );
}
