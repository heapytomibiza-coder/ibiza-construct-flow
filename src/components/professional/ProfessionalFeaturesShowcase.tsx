import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ChevronRight } from 'lucide-react';
import { ProfessionalStatsCards } from './features/ProfessionalStatsCards';
import { ContinueJourneySection } from './features/ContinueJourneySection';
import { RecentJobsSection } from './features/RecentJobsSection';
import { BusinessToolsGrid } from './features/BusinessToolsGrid';

export function ProfessionalFeaturesShowcase() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 px-4 sm:px-0 max-w-6xl mx-auto">
      {/* Stats Overview */}
      <ProfessionalStatsCards />

      {/* Continue Your Journey */}
      <ContinueJourneySection />

      {/* Recent Activity */}
      <RecentJobsSection />

      {/* Business Tools */}
      <BusinessToolsGrid />

      {/* Profile Completion CTA */}
      <Card className="card-luxury border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Complete Your Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Get 3x more opportunities with a complete profile
                </p>
              </div>
            </div>
            <Button 
              className="bg-gradient-hero hover:bg-copper text-white"
              onClick={() => navigate('/settings/profile')}
            >
              Complete Profile
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
