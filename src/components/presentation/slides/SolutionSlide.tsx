import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { Users, ArrowRightLeft, Shield } from "lucide-react";

export const SolutionSlide = () => {
  return (
    <SlideLayout background="gradient">
      <SlideTitle>The Solution</SlideTitle>
      <SlideSubtitle>
        A trusted two-sided marketplace that solves problems for BOTH property owners
        and professionals
      </SlideSubtitle>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        <div className="text-center p-8 rounded-2xl bg-background/80 backdrop-blur border border-sage-muted/30 hover:border-copper/50 transition-colors">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-sage/20 to-sage/5 flex items-center justify-center mx-auto mb-6">
            <Users className="h-10 w-10 text-sage" />
          </div>
          <h3 className="text-2xl font-bold mb-3">For Property Owners</h3>
          <p className="text-muted-foreground">
            Find verified professionals, compare quotes, and work with confidence
            through SafePay protection
          </p>
        </div>

        <div className="text-center p-8 rounded-2xl bg-background/80 backdrop-blur border border-copper/30 hover:border-copper/50 transition-colors flex items-center justify-center">
          <div>
            <ArrowRightLeft className="h-16 w-16 text-copper mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-copper">Trusted Connection</h3>
          </div>
        </div>

        <div className="text-center p-8 rounded-2xl bg-background/80 backdrop-blur border border-sage-muted/30 hover:border-copper/50 transition-colors">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-copper/20 to-copper/5 flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-copper" />
          </div>
          <h3 className="text-2xl font-bold mb-3">For Professionals</h3>
          <p className="text-muted-foreground">
            Access qualified leads, showcase your work, and get paid securely with
            guaranteed payment protection
          </p>
        </div>
      </div>
    </SlideLayout>
  );
};
