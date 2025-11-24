import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { Shield, Lock, CheckCircle, AlertCircle } from "lucide-react";

export const SafePaySlide = () => {
  return (
    <SlideLayout background="copper">
      <SlideTitle>SafePay Protection</SlideTitle>
      <SlideSubtitle>Your money is protected until you're 100% satisfied</SlideSubtitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-background/80 backdrop-blur border border-sage-muted/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-copper/20 flex items-center justify-center">
                <Lock className="h-6 w-6 text-copper" />
              </div>
              <h4 className="font-bold text-lg">Escrow Account</h4>
            </div>
            <p className="text-muted-foreground">
              Funds are held securely until project milestones are completed to your
              satisfaction
            </p>
          </div>

          <div className="p-6 rounded-xl bg-background/80 backdrop-blur border border-sage-muted/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-sage/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-sage" />
              </div>
              <h4 className="font-bold text-lg">Milestone Releases</h4>
            </div>
            <p className="text-muted-foreground">
              Release payments as work progresses, keeping you in control
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-background/80 backdrop-blur border border-sage-muted/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-copper/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-copper" />
              </div>
              <h4 className="font-bold text-lg">Dispute Resolution</h4>
            </div>
            <p className="text-muted-foreground">
              Professional mediation team available if any issues arise
            </p>
          </div>

          <div className="p-6 rounded-xl bg-background/80 backdrop-blur border border-sage-muted/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-sage/20 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-sage" />
              </div>
              <h4 className="font-bold text-lg">Quality Guarantee</h4>
            </div>
            <p className="text-muted-foreground">
              Money-back guarantee if work doesn't meet agreed standards
            </p>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
};
