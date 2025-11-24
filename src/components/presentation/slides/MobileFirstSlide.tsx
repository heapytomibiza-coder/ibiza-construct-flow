import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { Smartphone, Tablet, Monitor } from "lucide-react";

export const MobileFirstSlide = () => {
  return (
    <SlideLayout>
      <SlideTitle>Mobile-First Design</SlideTitle>
      <SlideSubtitle>Manage everything on-the-go - optimized for mobile</SlideSubtitle>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-sage/10 to-transparent border border-sage-muted/30">
          <div className="h-20 w-20 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-6">
            <Smartphone className="h-10 w-10 text-sage" />
          </div>
          <h4 className="font-bold text-xl mb-3">Mobile</h4>
          <div className="text-4xl font-bold text-copper mb-2">65%</div>
          <p className="text-muted-foreground">of traffic</p>
          <div className="mt-6 space-y-2 text-sm text-left">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-sage" />
              <span>Browse services</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-sage" />
              <span>Chat with pros</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-sage" />
              <span>Track projects</span>
            </div>
          </div>
        </div>

        <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-copper/10 to-transparent border border-copper/30">
          <div className="h-20 w-20 rounded-full bg-copper/10 flex items-center justify-center mx-auto mb-6">
            <Tablet className="h-10 w-10 text-copper" />
          </div>
          <h4 className="font-bold text-xl mb-3">Tablet</h4>
          <div className="text-4xl font-bold text-copper mb-2">20%</div>
          <p className="text-muted-foreground">of traffic</p>
          <div className="mt-6 space-y-2 text-sm text-left">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-copper" />
              <span>Review portfolios</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-copper" />
              <span>Submit quotes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-copper" />
              <span>Manage bookings</span>
            </div>
          </div>
        </div>

        <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-sage/10 to-transparent border border-sage-muted/30">
          <div className="h-20 w-20 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-6">
            <Monitor className="h-10 w-10 text-sage" />
          </div>
          <h4 className="font-bold text-xl mb-3">Desktop</h4>
          <div className="text-4xl font-bold text-copper mb-2">15%</div>
          <p className="text-muted-foreground">of traffic</p>
          <div className="mt-6 space-y-2 text-sm text-left">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-sage" />
              <span>Detailed planning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-sage" />
              <span>Analytics review</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-sage" />
              <span>Document uploads</span>
            </div>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
};
