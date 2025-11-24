import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { BadgeCheck, FolderCheck, Shield, Star, Clock, ThumbsUp } from "lucide-react";

export const TractionSlide = () => {
  return (
    <SlideLayout background="sage">
      <SlideTitle>Traction & Social Proof</SlideTitle>
      <SlideSubtitle>Proven track record with thousands of satisfied users</SlideSubtitle>

      <div className="grid grid-cols-3 gap-6 mt-12">
        <div className="text-center p-6 rounded-xl bg-background/80 backdrop-blur border border-sage-muted/30">
          <BadgeCheck className="h-12 w-12 text-copper mx-auto mb-4" />
          <div className="text-4xl font-bold text-copper mb-2">500+</div>
          <div className="text-muted-foreground">Verified Professionals</div>
        </div>

        <div className="text-center p-6 rounded-xl bg-background/80 backdrop-blur border border-sage-muted/30">
          <FolderCheck className="h-12 w-12 text-sage mx-auto mb-4" />
          <div className="text-4xl font-bold text-sage mb-2">2,000+</div>
          <div className="text-muted-foreground">Completed Projects</div>
        </div>

        <div className="text-center p-6 rounded-xl bg-background/80 backdrop-blur border border-sage-muted/30">
          <Shield className="h-12 w-12 text-copper mx-auto mb-4" />
          <div className="text-4xl font-bold text-copper mb-2">€20M+</div>
          <div className="text-muted-foreground">Protected Transactions</div>
        </div>

        <div className="text-center p-6 rounded-xl bg-background/80 backdrop-blur border border-sage-muted/30">
          <Star className="h-12 w-12 text-sage mx-auto mb-4" />
          <div className="text-4xl font-bold text-sage mb-2">4.8★</div>
          <div className="text-muted-foreground">Average Rating</div>
        </div>

        <div className="text-center p-6 rounded-xl bg-background/80 backdrop-blur border border-sage-muted/30">
          <ThumbsUp className="h-12 w-12 text-copper mx-auto mb-4" />
          <div className="text-4xl font-bold text-copper mb-2">94%</div>
          <div className="text-muted-foreground">Client Satisfaction</div>
        </div>

        <div className="text-center p-6 rounded-xl bg-background/80 backdrop-blur border border-sage-muted/30">
          <Clock className="h-12 w-12 text-sage mx-auto mb-4" />
          <div className="text-4xl font-bold text-sage mb-2">24h</div>
          <div className="text-muted-foreground">Avg Response Time</div>
        </div>
      </div>

      <div className="mt-8 p-8 rounded-2xl bg-background/80 backdrop-blur border border-sage-muted/30">
        <div className="text-center mb-6">
          <h4 className="text-2xl font-bold mb-2">Client Testimonials</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg bg-muted/30">
            <p className="text-sm italic mb-3">
              "Finally found reliable professionals in Ibiza. The SafePay system gave me
              total peace of mind."
            </p>
            <div className="font-medium">- Sarah M., Villa Owner</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/30">
            <p className="text-sm italic mb-3">
              "As a professional, this platform has transformed my business. Quality leads
              and guaranteed payments."
            </p>
            <div className="font-medium">- Carlos R., Contractor</div>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
};
