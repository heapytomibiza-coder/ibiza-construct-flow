import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { ComparisonTable } from "../ComparisonTable";

export const CompetitiveAdvantagesSlide = () => {
  const features = [
    { name: "Ibiza-focused expertise", us: true, them: false },
    { name: "Verified professionals", us: true, them: false },
    { name: "SafePay protection", us: true, them: false },
    { name: "Bilingual platform", us: true, them: false },
    { name: "AI-powered matching", us: true, them: false },
    { name: "Price transparency", us: true, them: false },
  ];

  return (
    <SlideLayout>
      <SlideTitle>Competitive Advantages</SlideTitle>
      <SlideSubtitle>Purpose-built for Ibiza's unique market</SlideSubtitle>

      <div className="mt-12">
        <ComparisonTable features={features} />
      </div>
    </SlideLayout>
  );
};
