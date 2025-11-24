import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";

export const RoadmapSlide = () => {
  return (
    <SlideLayout>
      <SlideTitle>Roadmap & Vision</SlideTitle>
      <SlideSubtitle>From Ibiza's #1 platform to the Balearic Islands' leading network</SlideSubtitle>

      <div className="mt-12 space-y-8">
        <div className="flex gap-6 items-start">
          <div className="flex-shrink-0 w-32 text-center">
            <div className="text-2xl font-bold text-copper">Phase 1</div>
            <div className="text-sm text-muted-foreground">Current</div>
          </div>
          <div className="flex-1 p-6 rounded-xl bg-copper/10 border border-copper/30">
            <h4 className="font-bold mb-2">Core Marketplace ✓</h4>
            <p className="text-sm text-muted-foreground">Two-sided marketplace, SafePay, verified professionals</p>
          </div>
        </div>

        <div className="flex gap-6 items-start">
          <div className="flex-shrink-0 w-32 text-center">
            <div className="text-2xl font-bold text-sage">Phase 2</div>
            <div className="text-sm text-muted-foreground">Q1 2025</div>
          </div>
          <div className="flex-1 p-6 rounded-xl bg-sage/10 border border-sage/30">
            <h4 className="font-bold mb-2">Enhanced Features</h4>
            <p className="text-sm text-muted-foreground">Professional verification automation, advanced analytics, mobile app launch</p>
          </div>
        </div>

        <div className="flex gap-6 items-start">
          <div className="flex-shrink-0 w-32 text-center">
            <div className="text-2xl font-bold text-copper">Phase 3</div>
            <div className="text-sm text-muted-foreground">Q2 2025</div>
          </div>
          <div className="flex-1 p-6 rounded-xl bg-copper/10 border border-copper/30">
            <h4 className="font-bold mb-2">AI & Marketplace Expansion</h4>
            <p className="text-sm text-muted-foreground">AI project estimation, materials marketplace, professional training programs</p>
          </div>
        </div>

        <div className="flex gap-6 items-start">
          <div className="flex-shrink-0 w-32 text-center">
            <div className="text-2xl font-bold text-sage">Phase 4</div>
            <div className="text-sm text-muted-foreground">2025+</div>
          </div>
          <div className="flex-1 p-6 rounded-xl bg-sage/10 border border-sage/30">
            <h4 className="font-bold mb-2">Geographic Expansion</h4>
            <p className="text-sm text-muted-foreground">Mallorca, Formentera, insurance partnerships, financing options</p>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
};
