import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { Star, BadgeCheck, Clock, MapPin } from "lucide-react";
import { ScreenshotFrame } from "../ScreenshotFrame";
import { ImageGallery } from "../ImageGallery";

export const ProfessionalProfileSlide = () => {
  return (
    <SlideLayout>
      <SlideTitle>Get Matched with Professionals</SlideTitle>
      <SlideSubtitle>Review detailed profiles before making your decision</SlideSubtitle>

      <div className="mt-12">
        <ScreenshotFrame url="constructive-solutions-ibiza.com/professionals/sound-automation">
          <div className="p-8">
            <div className="flex items-start gap-6 mb-8">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-sage/30 to-copper/30 flex-shrink-0 flex items-center justify-center">
                <div className="text-3xl font-bold text-copper">SA</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold">Sound & Automation Ibiza</h3>
                  <BadgeCheck className="h-6 w-6 text-copper" />
                </div>
                <p className="text-muted-foreground mb-4">
                  High-end multiroom audio, home cinema systems, and professional AV
                  integration - 15+ years in luxury villa installations
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-copper/10 border border-copper/30">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">4.9</span>
                    <span className="text-muted-foreground text-sm">(127 reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage/10 border border-sage/30 text-muted-foreground text-sm">
                    <Clock className="h-4 w-4" />
                    Responds in 2 hours
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage/10 border border-sage/30 text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4" />
                    Ibiza, Santa Eulalia
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-bold mb-3">Recent Projects</h4>
              <ImageGallery 
                images={[
                  { id: 1, label: "Villa Multiroom System" },
                  { id: 2, label: "Home Cinema Installation" },
                  { id: 3, label: "Outdoor Audio" },
                  { id: 4, label: "Smart Home Integration" },
                  { id: 5, label: "Conference Room AV" },
                  { id: 6, label: "Restaurant Sound System" }
                ]} 
                columns={3}
              />
            </div>
          </div>
        </ScreenshotFrame>
      </div>
    </SlideLayout>
  );
};
