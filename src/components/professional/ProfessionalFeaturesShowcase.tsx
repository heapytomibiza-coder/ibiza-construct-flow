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
    <div className="space-y-8">
      {/* Hero Stats Bar */}
      <HeroStatsBar />

      {/* Featured Actions */}
      <FeatureCategorySection icon="⭐" title="Featured Actions" columns={3}>
        <FeaturedActionCard
          icon={Briefcase}
          title="Browse Jobs"
          description="24 new opportunities match your skills"
          metric="24"
          gradient="from-blue-500/20 to-cyan-400/10"
          path="/job-board"
          action="Find Projects"
        />
        <FeaturedActionCard
          icon={FileText}
          title="My Services"
          description="Create and manage your service offerings with custom pricing"
          gradient="from-orange-500/20 to-amber-400/10"
          path="/professional/services"
          action="Manage Services"
        />
        <FeaturedActionCard
          icon={Star}
          title="Portfolio"
          description="Showcase your completed projects and client testimonials"
          gradient="from-purple-500/20 to-pink-400/10"
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
          gradient="from-green-500/10 to-emerald-400/5"
          path="/earnings"
          action="View Earnings"
        />
        <CompactFeatureCard
          icon={Users}
          title="Client Matching"
          description="AI matches you with ideal clients"
          gradient="from-blue-500/10 to-cyan-400/5"
          path="/job-board"
          action="View Matches"
        />
        <CompactFeatureCard
          icon={TrendingUp}
          title="Performance Insights"
          description="Get personalized recommendations"
          gradient="from-purple-500/10 to-pink-400/5"
          path="/dashboard/pro"
          action="View Insights"
        />
        <CompactFeatureCard
          icon={Shield}
          title="Verification Badge"
          description="Build trust with credentials"
          gradient="from-orange-500/10 to-amber-400/5"
          path="/professional/verification"
          action="Get Verified"
        />
      </FeatureCategorySection>

      {/* Client & Project Management */}
      <FeatureCategorySection icon="💬" title="Manage Clients" columns={4}>
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
            <div className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚙️</span>
                <h3 className="text-lg font-semibold">Settings & Tools</h3>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-4 pt-0">
              <Card className="p-3 hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => navigate('/settings/notifications')}>
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Smart Notifications</p>
                    <p className="text-xs text-muted-foreground">Configure alerts</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3 hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => navigate('/professional/service-setup')}>
                <div className="flex items-center gap-3">
                  <Wrench className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Service Setup</p>
                    <p className="text-xs text-muted-foreground">Create packages</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3 hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => navigate('/professional/payout-setup')}>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Payout Settings</p>
                    <p className="text-xs text-muted-foreground">Bank details</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3 hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => navigate('/settings/profile')}>
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Account Settings</p>
                    <p className="text-xs text-muted-foreground">Manage profile</p>
                  </div>
                </div>
              </Card>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold mb-1">Ready to Grow Your Business?</h3>
            <p className="text-sm text-muted-foreground">
              Complete your profile and start winning quality projects today
            </p>
          </div>
          <Button 
            size="lg"
            onClick={() => navigate('/job-board')}
            className="bg-primary hover:bg-primary/90"
          >
            Browse Jobs
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
