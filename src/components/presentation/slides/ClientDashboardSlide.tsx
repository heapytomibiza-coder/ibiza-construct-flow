import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { FolderOpen, Plus, MessageSquare, Calendar } from "lucide-react";

export const ClientDashboardSlide = () => {
  return (
    <SlideLayout>
      <SlideTitle>Client Dashboard Overview</SlideTitle>
      <SlideSubtitle>One dashboard to manage all your property projects</SlideSubtitle>

      <div className="grid grid-cols-2 gap-6 mt-12">
        <div className="p-8 rounded-xl bg-gradient-to-br from-copper/10 to-copper/5 border border-copper/30">
          <FolderOpen className="h-12 w-12 text-copper mb-4" />
          <div className="text-4xl font-bold mb-2">8</div>
          <div className="text-muted-foreground">Active Projects</div>
        </div>

        <div className="p-8 rounded-xl bg-gradient-to-br from-sage/10 to-sage/5 border border-sage/30">
          <MessageSquare className="h-12 w-12 text-sage mb-4" />
          <div className="text-4xl font-bold mb-2">12</div>
          <div className="text-muted-foreground">Unread Messages</div>
        </div>

        <div className="col-span-2 p-8 rounded-xl bg-card border border-sage-muted/30">
          <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-4">
            <button className="p-4 rounded-lg bg-copper/10 hover:bg-copper/20 transition-colors text-center">
              <Plus className="h-6 w-6 mx-auto mb-2 text-copper" />
              <div className="text-sm font-medium">Post Job</div>
            </button>
            <button className="p-4 rounded-lg bg-sage/10 hover:bg-sage/20 transition-colors text-center">
              <FolderOpen className="h-6 w-6 mx-auto mb-2 text-sage" />
              <div className="text-sm font-medium">Browse Services</div>
            </button>
            <button className="p-4 rounded-lg bg-copper/10 hover:bg-copper/20 transition-colors text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-copper" />
              <div className="text-sm font-medium">Schedule</div>
            </button>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
};
