import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { Star, BadgeCheck, Clock, MapPin } from "lucide-react";

export const ProfessionalProfileSlide = () => {
  return (
    <SlideLayout>
      <SlideTitle>Get Matched with Professionals</SlideTitle>
      <SlideSubtitle>Review detailed profiles before making your decision</SlideSubtitle>

      <div className="mt-12 p-8 rounded-2xl bg-card border border-sage-muted/30 shadow-lg">
        <div className="flex items-start gap-6 mb-8">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-sage/30 to-copper/30 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold">Sound & Automation Ibiza</h3>
              <BadgeCheck className="h-6 w-6 text-copper" />
            </div>
            <p className="text-muted-foreground mb-4">
              High-end multiroom audio, home cinema systems, and professional AV
              integration
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold">4.9</span>
                <span className="text-muted-foreground">(127 reviews)</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-5 w-5" />
                Responds in 2 hours
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                Ibiza, Santa Eulalia
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 rounded-lg bg-gradient-to-br from-sage/20 to-copper/20"
            />
          ))}
        </div>
      </div>
    </SlideLayout>
  );
};
