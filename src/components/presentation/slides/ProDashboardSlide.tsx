import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { TrendingUp, Briefcase, Eye } from "lucide-react";
import { ScreenshotFrame } from "../ScreenshotFrame";
import { MiniDashboard } from "../MiniDashboard";
import { StatCounter } from "../StatCounter";

export const ProDashboardSlide = () => {
  return (
    <SlideLayout>
      <SlideTitle>Professional Dashboard</SlideTitle>
      <SlideSubtitle>Everything you need to run your business in one place</SlideSubtitle>

      <div className="mt-12">
        <ScreenshotFrame url="constructive-solutions-ibiza.com/dashboard/professional">
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-6 rounded-xl bg-gradient-to-br from-copper/10 to-copper/5 border border-copper/30 text-center">
                <TrendingUp className="h-10 w-10 text-copper mx-auto mb-3" />
                <StatCounter value={15847} label="This Month" prefix="€" duration={2000} />
                <div className="text-sm text-sage mt-2">+23% vs last month</div>
              </div>

              <div className="p-6 rounded-xl bg-gradient-to-br from-sage/10 to-sage/5 border border-sage/30 text-center">
                <Briefcase className="h-10 w-10 text-sage mx-auto mb-3" />
                <StatCounter value={8} label="Active Jobs" duration={1500} valueColor="text-sage" />
                <div className="text-sm text-copper mt-2">3 pending quotes</div>
              </div>

              <div className="p-6 rounded-xl bg-gradient-to-br from-copper/10 to-sage/10 border border-sage-muted/30 text-center">
                <Eye className="h-10 w-10 text-copper mx-auto mb-3" />
                <StatCounter value={127} label="Profile Views" duration={1800} />
                <div className="text-sm text-sage mt-2">This week</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold mb-4">Quick Stats</h4>
                <MiniDashboard type="professional" />
              </div>

              <div className="p-6 rounded-xl bg-card border border-sage-muted/30">
                <h4 className="font-bold mb-4">Recent Activity</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm">
                    <div>
                      <div className="font-medium">New quote request</div>
                      <div className="text-xs text-muted-foreground">Home Cinema Installation</div>
                    </div>
                    <div className="text-xs text-muted-foreground">2h ago</div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm">
                    <div>
                      <div className="font-medium">Payment received</div>
                      <div className="text-xs text-muted-foreground">€3,200 Villa Audio</div>
                    </div>
                    <div className="text-xs text-muted-foreground">1d ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScreenshotFrame>
      </div>
    </SlideLayout>
  );
};
