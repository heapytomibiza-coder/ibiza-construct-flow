import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { Image, Star, MessageSquare } from "lucide-react";

export const PortfolioSlide = () => {
  return (
    <SlideLayout>
      <SlideTitle>Portfolio & Reviews</SlideTitle>
      <SlideSubtitle>Let your work speak for itself - showcase your best projects</SlideSubtitle>

      <div className="grid grid-cols-2 gap-8 mt-12">
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-card border border-sage-muted/30">
            <Image className="h-10 w-10 text-copper mb-4" />
            <h4 className="font-bold text-lg mb-2">Before/After Photos</h4>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="h-24 rounded-lg bg-gradient-to-br from-sage/20 to-copper/20" />
              <div className="h-24 rounded-lg bg-gradient-to-br from-copper/30 to-sage/30" />
            </div>
          </div>

          <div className="p-6 rounded-xl bg-card border border-sage-muted/30">
            <MessageSquare className="h-10 w-10 text-copper mb-4" />
            <h4 className="font-bold text-lg mb-2">Project Descriptions</h4>
            <p className="text-sm text-muted-foreground">
              "Transformed this luxury villa with a state-of-the-art multiroom audio
              system..."
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-gradient-to-br from-sage/10 to-copper/10 border border-copper/30">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-copper mb-2">4.9</div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="text-muted-foreground">Based on 127 reviews</div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-card border border-sage-muted/30">
            <h4 className="font-bold mb-4">Recent Review</h4>
            <p className="text-sm text-muted-foreground mb-3">
              "Exceptional quality and professionalism. The team exceeded all
              expectations."
            </p>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sage/30 to-copper/30" />
              <div className="text-sm">
                <div className="font-medium">Maria S.</div>
                <div className="text-muted-foreground">2 days ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
};
