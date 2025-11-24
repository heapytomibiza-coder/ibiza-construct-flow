import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { Check } from "lucide-react";

const features = [
  "ID Verification for all professionals",
  "License & insurance validation",
  "Portfolio verification",
  "Client review system",
  "SafePay escrow protection",
  "Dispute resolution",
  "Quality guarantees",
  "24/7 Support",
];

export const TrustSafetySlide = () => {
  return (
    <SlideLayout background="sage">
      <SlideTitle>Trust & Safety</SlideTitle>
      <SlideSubtitle>
        Enterprise-grade security and verification at every step
      </SlideSubtitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 rounded-lg bg-background/80 backdrop-blur border border-sage-muted/30"
          >
            <div className="h-8 w-8 rounded-full bg-sage/20 flex items-center justify-center flex-shrink-0">
              <Check className="h-5 w-5 text-sage" />
            </div>
            <span className="font-medium">{feature}</span>
          </div>
        ))}
      </div>
    </SlideLayout>
  );
};
