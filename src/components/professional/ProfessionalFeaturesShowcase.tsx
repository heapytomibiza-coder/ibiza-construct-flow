import { HeroStatsBar } from './features/HeroStatsBar';
import { FeaturedActionCard } from './features/FeaturedActionCard';
import { FeatureCategorySection } from './features/FeatureCategorySection';
import { CompactFeatureCard } from './features/CompactFeatureCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  BarChart3, 
  CreditCard, 
  MessageSquare,
  Star,
  Users,
  Shield,
  TrendingUp,
  Calendar,
  Bell,
  Settings,
  FileText,
  Wrench,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function ProfessionalFeaturesShowcase() {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Hero Stats Bar */}
      <HeroStatsBar />

      {/* Featured Actions */}
      <FeatureCategorySection icon="⭐" title="Featured Actions" columns={3}>
        <FeaturedActionCard
          icon={Briefcase}
          title="Browse Jobs"
          description="24 new opportunities match your skills"
          metric="24"
          path="/job-board"
          action="Find Projects"
        />
        <FeaturedActionCard
          icon={FileText}
          title="My Services"
          description="Create and manage your service offerings with custom pricing"
          path="/professional/services"
          action="Manage Services"
        />
        <FeaturedActionCard
          icon={Star}
          title="Portfolio"
          description="Showcase your completed projects and client testimonials"
          path="/professional/portfolio"
          action="Update Portfolio"
        />
      </FeatureCategorySection>

      {/* Core Business Tools */}
      <FeatureCategorySection icon="🎯" title="Grow Your Business" columns={3}>
        <CompactFeatureCard
          icon={BarChart3}
          title="Earnings & Analytics"
          description="Track income, performance, and growth metrics"
          gradient="from-sage-light/15 to-sage/8"
          path="/earnings"
          action="View Earnings"
        />
        <CompactFeatureCard
          icon={Users}
          title="Client Matching"
          description="AI matches you with ideal clients"
          gradient="from-sage-light/15 to-sage/8"
          path="/job-board"
          action="View Matches"
        />
        <CompactFeatureCard
          icon={TrendingUp}
          title="Performance Insights"
          description="Get personalized recommendations"
          gradient="from-sage-light/15 to-sage/8"
          path="/dashboard/pro"
          action="View Insights"
        />
        <CompactFeatureCard
          icon={Shield}
          title="Verification Badge"
          description="Build trust with credentials"
          gradient="from-sage-light/15 to-sage/8"
          path="/professional/verification"
          action="Get Verified"
        />
      </FeatureCategorySection>

      {/* Client & Project Management */}
      <FeatureCategorySection icon="💬" title="Client Management" columns={4}>
        <CompactFeatureCard
          icon={MessageSquare}
          title="Communications"
          description="Chat with clients and share updates"
          path="/messages"
          action="Open Messages"
          badge={3}
        />
        <CompactFeatureCard
          icon={FileText}
          title="Contracts"
          description="Review and manage agreements"
          path="/contracts"
          action="View Contracts"
          badge={1}
        />
        <CompactFeatureCard
          icon={CreditCard}
          title="Secure Payments"
          description="Track earnings and payouts"
          path="/payments"
          action="Manage Payments"
        />
        <CompactFeatureCard
          icon={Calendar}
          title="Availability"
          description="Set working hours and blocked dates"
          path="/availability"
          action="Set Schedule"
        />
      </FeatureCategorySection>

      {/* Settings & Configuration */}
      <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
        <Card className="border-border/50">
          <CollapsibleTrigger className="w-full">
            <div className="p-3 flex items-center justify-between hover:bg-accent/50 transition-colors rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚙️</span>
                <h3 className="text-base font-semibold">Settings & Tools</h3>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 p-3 pt-0">
              <Card className="p-2.5 hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => navigate('/settings/notifications')}>
                <div className="flex items-center gap-2.5">
                  <Bell className="h-4 w-4 text-sage" />
                  <div>
                    <p className="font-medium text-xs">Smart Notifications</p>
                    <p className="text-[10px] text-muted-foreground">Configure alerts</p>
                  </div>
                </div>
              </Card>
              <Card className="p-2.5 hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => navigate('/professional/service-setup')}>
                <div className="flex items-center gap-2.5">
                  <Wrench className="h-4 w-4 text-sage" />
                  <div>
                    <p className="font-medium text-xs">Service Setup</p>
                    <p className="text-[10px] text-muted-foreground">Create packages</p>
                  </div>
                </div>
              </Card>
              <Card className="p-2.5 hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => navigate('/professional/payout-setup')}>
                <div className="flex items-center gap-2.5">
                  <CreditCard className="h-4 w-4 text-sage" />
                  <div>
                    <p className="font-medium text-xs">Payout Settings</p>
                    <p className="text-[10px] text-muted-foreground">Bank details</p>
                  </div>
                </div>
              </Card>
              <Card className="p-2.5 hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => navigate('/settings/profile')}>
                <div className="flex items-center gap-2.5">
                  <Settings className="h-4 w-4 text-sage" />
                  <div>
                    <p className="font-medium text-xs">Account Settings</p>
                    <p className="text-[10px] text-muted-foreground">Manage profile</p>
                  </div>
                </div>
              </Card>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-sage/25 to-sage-dark/15 border-sage/30">
        <CardContent className="p-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold mb-1">Ready to Grow Your Business?</h3>
            <p className="text-xs text-muted-foreground">
              Complete your profile and start winning quality projects today
            </p>
          </div>
          <Button 
            onClick={() => navigate('/job-board')}
            className="bg-sage hover:bg-sage-dark text-white whitespace-nowrap"
          >
            Browse Jobs
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
