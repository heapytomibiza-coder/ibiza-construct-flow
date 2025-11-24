import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { MessageSquare, Image, FileText, CheckCircle } from "lucide-react";
import { ChatMockup } from "../ChatMockup";

export const CommunicationSlide = () => {
  return (
    <SlideLayout>
      <SlideTitle>Communication & Collaboration</SlideTitle>
      <SlideSubtitle>
        Communicate directly, share photos, track progress - all in one place
      </SlideSubtitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <div>
          <ChatMockup
            messages={[
              {
                id: 1,
                sender: "professional",
                content: "I can start next week. Here are the materials needed for your multiroom audio system...",
                time: "2 hours ago"
              },
              {
                id: 2,
                sender: "client",
                content: "Perfect! I've attached photos of the space. When can you visit for measurements?",
                time: "1 hour ago"
              },
              {
                id: 3,
                sender: "professional",
                content: "I can come by tomorrow afternoon. Does 3 PM work for you?",
                time: "30 min ago"
              },
              {
                id: 4,
                sender: "client",
                content: "Yes, that's perfect. See you then!",
                time: "Just now"
              }
            ]}
          />
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-xl bg-card border border-sage-muted/30">
            <h4 className="font-bold mb-4 text-lg">Communication Features</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-copper/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-copper" />
                </div>
                <div>
                  <div className="font-medium">Real-time messaging</div>
                  <div className="text-sm text-muted-foreground">Instant notifications on all devices</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-sage/10 flex items-center justify-center flex-shrink-0">
                  <Image className="h-5 w-5 text-sage" />
                </div>
                <div>
                  <div className="font-medium">Photo & file sharing</div>
                  <div className="text-sm text-muted-foreground">Share plans, photos, and documents</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-copper/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-copper" />
                </div>
                <div>
                  <div className="font-medium">Quote requests</div>
                  <div className="text-sm text-muted-foreground">Request and receive formal quotes</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-sage/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-sage" />
                </div>
                <div>
                  <div className="font-medium">Progress tracking</div>
                  <div className="text-sm text-muted-foreground">Milestone updates and approvals</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
};
