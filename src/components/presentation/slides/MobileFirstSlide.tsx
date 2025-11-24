import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { Smartphone, Tablet, Monitor, Search, Star } from "lucide-react";
import { PhoneMockup } from "../PhoneMockup";

export const MobileFirstSlide = () => {
  return (
    <SlideLayout>
      <SlideTitle>Mobile-First Design</SlideTitle>
      <SlideSubtitle>Manage everything on-the-go - optimized for mobile</SlideSubtitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 items-center">
        <PhoneMockup>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Search services...</span>
            </div>
            
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 rounded-lg bg-background border border-sage-muted/30">
                  <div className="flex gap-2 mb-2">
                    <div className="h-12 w-12 rounded bg-gradient-to-br from-sage/20 to-copper/20 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs truncate">Service {i}</div>
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="h-2 w-2 fill-yellow-400 text-yellow-400" />
                        <span>4.9</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-copper font-bold">From €{i * 1000}</div>
                </div>
              ))}
            </div>
          </div>
        </PhoneMockup>

        <div className="space-y-6">
          <div className="text-center p-6 rounded-2xl bg-gradient-to-b from-sage/10 to-transparent border border-sage-muted/30">
            <div className="h-16 w-16 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-sage" />
            </div>
            <h4 className="font-bold text-xl mb-2">Mobile</h4>
            <div className="text-5xl font-bold text-copper mb-2">65%</div>
            <p className="text-muted-foreground mb-4">of traffic</p>
            <div className="space-y-2 text-sm text-left">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-sage" />
                <span>Browse & book services</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-sage" />
                <span>Real-time chat</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-sage" />
                <span>Track projects</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-xl bg-copper/10 border border-copper/30">
              <Tablet className="h-8 w-8 text-copper mx-auto mb-2" />
              <div className="text-3xl font-bold text-copper mb-1">20%</div>
              <div className="text-xs text-muted-foreground">Tablet</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-sage/10 border border-sage/30">
              <Monitor className="h-8 w-8 text-sage mx-auto mb-2" />
              <div className="text-3xl font-bold text-sage mb-1">15%</div>
              <div className="text-xs text-muted-foreground">Desktop</div>
            </div>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
};
