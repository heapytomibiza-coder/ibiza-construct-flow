import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { Image as ImageIcon, Star, MessageSquare } from "lucide-react";
import { ImageGallery } from "../ImageGallery";

export const PortfolioSlide = () => {
  return (
    <SlideLayout>
      <SlideTitle>Portfolio & Reviews</SlideTitle>
      <SlideSubtitle>Let your work speak for itself - showcase your best projects</SlideSubtitle>

      <div className="grid grid-cols-2 gap-8 mt-12">
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-card border border-sage-muted/30">
            <div className="flex items-center gap-3 mb-4">
              <ImageIcon className="h-8 w-8 text-copper" />
              <h4 className="font-bold text-lg">Project Portfolio</h4>
            </div>
            <ImageGallery 
              images={[
                { id: 1, label: "Villa Audio System" },
                { id: 2, label: "Home Cinema" },
                { id: 3, label: "Smart Home" },
                { id: 4, label: "Outdoor Setup" },
                { id: 5, label: "Conference Room" },
                { id: 6, label: "Restaurant Audio" }
              ]}
              columns={2}
            />
          </div>

          <div className="p-6 rounded-xl bg-card border border-sage-muted/30">
            <MessageSquare className="h-8 w-8 text-sage mb-3" />
            <h4 className="font-bold text-lg mb-3">Featured Project</h4>
            <div className="space-y-2 text-sm">
              <p className="font-medium">Luxury Villa Multiroom System</p>
              <p className="text-muted-foreground">
                "Transformed this 5-bedroom villa with a state-of-the-art multiroom audio
                system, seamlessly integrated with smart home controls."
              </p>
              <div className="flex gap-2 flex-wrap mt-3">
                <span className="px-2 py-1 rounded bg-copper/10 text-copper text-xs">Multiroom Audio</span>
                <span className="px-2 py-1 rounded bg-sage/10 text-sage text-xs">Smart Home</span>
                <span className="px-2 py-1 rounded bg-copper/10 text-copper text-xs">Home Cinema</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-gradient-to-br from-sage/10 to-copper/10 border border-copper/30">
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-copper mb-3">4.9</div>
              <div className="flex items-center justify-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="text-lg font-medium mb-1">Outstanding Rating</div>
              <div className="text-muted-foreground">Based on 127 verified reviews</div>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { name: "Maria S.", text: "Exceptional quality and professionalism. The team exceeded all expectations.", time: "2 days ago" },
              { name: "James R.", text: "Perfect installation, great communication throughout. Highly recommend!", time: "1 week ago" },
              { name: "Sophie L.", text: "The audio quality is incredible. Worth every euro!", time: "2 weeks ago" }
            ].map((review, i) => (
              <div key={i} className="p-4 rounded-xl bg-card border border-sage-muted/30">
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <Star key={j} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-3 italic">
                  "{review.text}"
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-sage/30 to-copper/30" />
                  <div className="text-xs">
                    <div className="font-medium">{review.name}</div>
                    <div className="text-muted-foreground">{review.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideLayout>
  );
};
