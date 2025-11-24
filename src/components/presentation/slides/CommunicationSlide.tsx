import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { MessageSquare, Image, FileText, CheckCircle } from "lucide-react";

export const CommunicationSlide = () => {
  return (
    <SlideLayout>
      <SlideTitle>Communication & Collaboration</SlideTitle>
      <SlideSubtitle>
        Communicate directly, share photos, track progress - all in one place
      </SlideSubtitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-sage/5 border border-sage/20">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-sage/20 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium mb-1">Professional</div>
                <p className="text-sm text-muted-foreground">
                  I can start next week. Here are the materials needed...
                </p>
                <div className="text-xs text-muted-foreground mt-2">2 hours ago</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-copper/5 border border-copper/20 ml-8">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-copper/20 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium mb-1">You</div>
                <p className="text-sm text-muted-foreground">
                  Perfect! I've attached photos of the space
                </p>
                <div className="text-xs text-muted-foreground mt-2">1 hour ago</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-xl bg-card border border-sage-muted/30">
            <h4 className="font-bold mb-4">Features</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-copper" />
                <span>Real-time messaging</span>
              </li>
              <li className="flex items-center gap-3">
                <Image className="h-5 w-5 text-copper" />
                <span>Photo sharing</span>
              </li>
              <li className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-copper" />
                <span>Quote requests</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-copper" />
                <span>Progress tracking</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
};
