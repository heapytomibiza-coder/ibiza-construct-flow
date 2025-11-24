import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { Globe, MessageSquare, DollarSign } from "lucide-react";

export const BilingualSlide = () => {
  return (
    <SlideLayout>
      <SlideTitle>Bilingual Platform</SlideTitle>
      <SlideSubtitle>
        Seamlessly connect international clients with local professionals
      </SlideSubtitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <div className="p-8 rounded-2xl bg-gradient-to-br from-sage/10 to-sage/5 border border-sage/30">
          <Globe className="h-12 w-12 text-sage mb-6" />
          <h4 className="font-bold text-2xl mb-4">Full Translation</h4>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-sage mt-2" />
              <span>Complete English/Spanish interface</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-sage mt-2" />
              <span>All service descriptions translated</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-sage mt-2" />
              <span>Localized content for both markets</span>
            </li>
          </ul>
        </div>

        <div className="p-8 rounded-2xl bg-gradient-to-br from-copper/10 to-copper/5 border border-copper/30">
          <MessageSquare className="h-12 w-12 text-copper mb-6" />
          <h4 className="font-bold text-2xl mb-4">Chat Translation</h4>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-copper mt-2" />
              <span>Real-time message translation</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-copper mt-2" />
              <span>Communicate in your preferred language</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-copper mt-2" />
              <span>No language barriers</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 p-6 rounded-xl bg-card border border-sage-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <DollarSign className="h-10 w-10 text-copper" />
            <div>
              <div className="font-bold text-lg">Multi-Currency Support</div>
              <div className="text-muted-foreground">€ EUR, $ USD, £ GBP</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-copper">70%</div>
            <div className="text-sm text-muted-foreground">International clients</div>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
};
