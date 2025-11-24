import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { Check, X } from "lucide-react";

export const CompetitiveAdvantagesSlide = () => {
  const advantages = [
    { us: "Verified professionals", them: "Word-of-mouth referrals" },
    { us: "Price transparency", them: "Hidden costs & fees" },
    { us: "Payment protection", them: "Dispute risks" },
    { us: "Instant booking", them: "Weeks of phone calls" },
    { us: "Ibiza-specific expertise", them: "Generic marketplace" },
    { us: "Bilingual support", them: "Language barriers" },
  ];

  return (
    <SlideLayout>
      <SlideTitle>Competitive Advantages</SlideTitle>
      <SlideSubtitle>Purpose-built for Ibiza's unique market</SlideSubtitle>

      <div className="mt-12 space-y-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 rounded-xl bg-sage/10 border border-sage/30">
            <h4 className="font-bold text-lg text-sage">Constructive Solutions</h4>
          </div>
          <div className="text-center p-4 rounded-xl bg-destructive/10 border border-destructive/30">
            <h4 className="font-bold text-lg text-destructive">Traditional / Generic</h4>
          </div>
        </div>

        {advantages.map((item, index) => (
          <div key={index} className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-sage/5 border border-sage/20">
              <div className="h-8 w-8 rounded-full bg-sage/20 flex items-center justify-center flex-shrink-0">
                <Check className="h-5 w-5 text-sage" />
              </div>
              <span className="font-medium">{item.us}</span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <div className="h-8 w-8 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                <X className="h-5 w-5 text-destructive" />
              </div>
              <span className="text-muted-foreground">{item.them}</span>
            </div>
          </div>
        ))}
      </div>
    </SlideLayout>
  );
};
