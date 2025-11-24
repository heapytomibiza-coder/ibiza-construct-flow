import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { BarChart3, TrendingUp, Eye, Target } from "lucide-react";

export const AnalyticsSlide = () => {
  return (
    <SlideLayout>
      <SlideTitle>Analytics & Insights</SlideTitle>
      <SlideSubtitle>Data-driven insights to optimize your experience</SlideSubtitle>

      <div className="grid grid-cols-2 gap-8 mt-12">
        <div className="space-y-6">
          <h4 className="text-xl font-bold">For Professionals</h4>
          <div className="p-6 rounded-xl bg-card border border-sage-muted/30">
            <TrendingUp className="h-8 w-8 text-copper mb-3" />
            <h5 className="font-bold mb-2">Earnings Trends</h5>
            <p className="text-sm text-muted-foreground">
              Track revenue by month, service type, and client
            </p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-sage-muted/30">
            <Eye className="h-8 w-8 text-copper mb-3" />
            <h5 className="font-bold mb-2">Profile Performance</h5>
            <p className="text-sm text-muted-foreground">
              Monitor views, clicks, and conversion rates
            </p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-sage-muted/30">
            <Target className="h-8 w-8 text-copper mb-3" />
            <h5 className="font-bold mb-2">Quote Acceptance Rate</h5>
            <p className="text-sm text-muted-foreground">
              Analyze which quotes win and optimize pricing
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-xl font-bold">For Clients</h4>
          <div className="p-6 rounded-xl bg-card border border-sage-muted/30">
            <BarChart3 className="h-8 w-8 text-sage mb-3" />
            <h5 className="font-bold mb-2">Project Spending</h5>
            <p className="text-sm text-muted-foreground">
              Visualize costs across all your property projects
            </p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-sage-muted/30">
            <Eye className="h-8 w-8 text-sage mb-3" />
            <h5 className="font-bold mb-2">Service History</h5>
            <p className="text-sm text-muted-foreground">
              Complete record of all work done on your property
            </p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-sage-muted/30">
            <TrendingUp className="h-8 w-8 text-sage mb-3" />
            <h5 className="font-bold mb-2">Savings Calculator</h5>
            <p className="text-sm text-muted-foreground">
              Compare quotes and track money saved
            </p>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
};
