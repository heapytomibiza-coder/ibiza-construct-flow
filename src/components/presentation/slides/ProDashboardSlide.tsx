import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { TrendingUp, Briefcase, Eye } from "lucide-react";

export const ProDashboardSlide = () => {
  return (
    <SlideLayout>
      <SlideTitle>Professional Dashboard</SlideTitle>
      <SlideSubtitle>Everything you need to run your business in one place</SlideSubtitle>

      <div className="grid grid-cols-3 gap-6 mt-12">
        <div className="p-8 rounded-xl bg-gradient-to-br from-copper/10 to-copper/5 border border-copper/30">
          <TrendingUp className="h-12 w-12 text-copper mb-4" />
          <div className="text-4xl font-bold mb-2">€15,847</div>
          <div className="text-muted-foreground">This Month</div>
          <div className="text-sm text-sage mt-2">+23% vs last month</div>
        </div>

        <div className="p-8 rounded-xl bg-gradient-to-br from-sage/10 to-sage/5 border border-sage/30">
          <Briefcase className="h-12 w-12 text-sage mb-4" />
          <div className="text-4xl font-bold mb-2">8</div>
          <div className="text-muted-foreground">Active Jobs</div>
          <div className="text-sm text-copper mt-2">3 pending quotes</div>
        </div>

        <div className="p-8 rounded-xl bg-gradient-to-br from-copper/10 to-sage/10 border border-sage-muted/30">
          <Eye className="h-12 w-12 text-copper mb-4" />
          <div className="text-4xl font-bold mb-2">127</div>
          <div className="text-muted-foreground">Profile Views</div>
          <div className="text-sm text-sage mt-2">This week</div>
        </div>
      </div>

      <div className="mt-8 p-6 rounded-xl bg-card border border-sage-muted/30">
        <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <div className="font-medium">New quote request</div>
              <div className="text-sm text-muted-foreground">Home Cinema Installation</div>
            </div>
            <div className="text-sm text-muted-foreground">2 hours ago</div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <div className="font-medium">Payment received</div>
              <div className="text-sm text-muted-foreground">€3,200 for Villa Audio System</div>
            </div>
            <div className="text-sm text-muted-foreground">Yesterday</div>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
};
