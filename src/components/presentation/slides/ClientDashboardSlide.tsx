import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { Briefcase, MessageSquare, Calendar, Settings } from "lucide-react";
import { ScreenshotFrame } from "../ScreenshotFrame";
import { MiniDashboard } from "../MiniDashboard";
import { StatCounter } from "../StatCounter";

export const ClientDashboardSlide = () => {
  return (
    <SlideLayout>
      <SlideTitle>Client Dashboard Overview</SlideTitle>
      <SlideSubtitle>Manage all your property projects from one central hub</SlideSubtitle>

      <div className="mt-12">
        <ScreenshotFrame url="constructive-solutions-ibiza.com/dashboard">
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-6 rounded-xl bg-sage/10">
                <Briefcase className="h-10 w-10 text-sage mx-auto mb-3" />
                <StatCounter value={5} label="Active Projects" duration={1500} valueColor="text-sage" />
              </div>
              <div className="text-center p-6 rounded-xl bg-copper/10">
                <MessageSquare className="h-10 w-10 text-copper mx-auto mb-3" />
                <StatCounter value={12} label="Unread Messages" duration={1200} />
              </div>
              <div className="text-center p-6 rounded-xl bg-sage/10">
                <Calendar className="h-10 w-10 text-sage mx-auto mb-3" />
                <StatCounter value={3} label="Upcoming" duration={1000} valueColor="text-sage" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <MiniDashboard type="client" />
              <div className="space-y-3">
                <button className="w-full p-4 rounded-xl bg-copper/10 hover:bg-copper/20 flex items-center gap-3">
                  <Settings className="h-5 w-5 text-copper" />
                  <span className="font-bold text-sm">Post New Job</span>
                </button>
                <button className="w-full p-4 rounded-xl bg-sage/10 hover:bg-sage/20 flex items-center gap-3">
                  <Settings className="h-5 w-5 text-sage" />
                  <span className="font-bold text-sm">Browse Services</span>
                </button>
              </div>
            </div>
          </div>
        </ScreenshotFrame>
      </div>
    </SlideLayout>
  );
};
