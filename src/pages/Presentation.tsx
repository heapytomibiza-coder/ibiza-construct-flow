import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Import all slide components
import { TitleSlide } from "@/components/presentation/slides/TitleSlide";
import { ProblemOwners } from "@/components/presentation/slides/ProblemOwners";
import { ProblemProfessionals } from "@/components/presentation/slides/ProblemProfessionals";
import { SolutionSlide } from "@/components/presentation/slides/SolutionSlide";
import { HowItWorksSlide } from "@/components/presentation/slides/HowItWorksSlide";
import { ServiceCategoriesSlide } from "@/components/presentation/slides/ServiceCategoriesSlide";
import { TrustSafetySlide } from "@/components/presentation/slides/TrustSafetySlide";
import { ClientDashboardSlide } from "@/components/presentation/slides/ClientDashboardSlide";
import { PostProjectSlide } from "@/components/presentation/slides/PostProjectSlide";
import { BrowseServicesSlide } from "@/components/presentation/slides/BrowseServicesSlide";
import { ProfessionalProfileSlide } from "@/components/presentation/slides/ProfessionalProfileSlide";
import { CommunicationSlide } from "@/components/presentation/slides/CommunicationSlide";
import { SafePaySlide } from "@/components/presentation/slides/SafePaySlide";
import { ProDashboardSlide } from "@/components/presentation/slides/ProDashboardSlide";
import { FindLeadsSlide } from "@/components/presentation/slides/FindLeadsSlide";
import { SubmitQuoteSlide } from "@/components/presentation/slides/SubmitQuoteSlide";
import { ManageServicesSlide } from "@/components/presentation/slides/ManageServicesSlide";
import { PortfolioSlide } from "@/components/presentation/slides/PortfolioSlide";
import { GetPaidSlide } from "@/components/presentation/slides/GetPaidSlide";
import { AIMatchingSlide } from "@/components/presentation/slides/AIMatchingSlide";
import { BilingualSlide } from "@/components/presentation/slides/BilingualSlide";
import { MobileFirstSlide } from "@/components/presentation/slides/MobileFirstSlide";
import { AnalyticsSlide } from "@/components/presentation/slides/AnalyticsSlide";
import { MarketOpportunitySlide } from "@/components/presentation/slides/MarketOpportunitySlide";
import { CompetitiveAdvantagesSlide } from "@/components/presentation/slides/CompetitiveAdvantagesSlide";
import { TractionSlide } from "@/components/presentation/slides/TractionSlide";
import { RevenueModelSlide } from "@/components/presentation/slides/RevenueModelSlide";
import { RoadmapSlide } from "@/components/presentation/slides/RoadmapSlide";
import { WhyNowSlide } from "@/components/presentation/slides/WhyNowSlide";
import { CallToActionSlide } from "@/components/presentation/slides/CallToActionSlide";

const slides = [
  { id: 1, component: TitleSlide, section: "Opening" },
  { id: 2, component: ProblemOwners, section: "Opening" },
  { id: 3, component: ProblemProfessionals, section: "Opening" },
  { id: 4, component: SolutionSlide, section: "Opening" },
  { id: 5, component: HowItWorksSlide, section: "How It Works" },
  { id: 6, component: ServiceCategoriesSlide, section: "How It Works" },
  { id: 7, component: TrustSafetySlide, section: "How It Works" },
  { id: 8, component: ClientDashboardSlide, section: "Client Journey" },
  { id: 9, component: PostProjectSlide, section: "Client Journey" },
  { id: 10, component: BrowseServicesSlide, section: "Client Journey" },
  { id: 11, component: ProfessionalProfileSlide, section: "Client Journey" },
  { id: 12, component: CommunicationSlide, section: "Client Journey" },
  { id: 13, component: SafePaySlide, section: "Client Journey" },
  { id: 14, component: ProDashboardSlide, section: "Professional Journey" },
  { id: 15, component: FindLeadsSlide, section: "Professional Journey" },
  { id: 16, component: SubmitQuoteSlide, section: "Professional Journey" },
  { id: 17, component: ManageServicesSlide, section: "Professional Journey" },
  { id: 18, component: PortfolioSlide, section: "Professional Journey" },
  { id: 19, component: GetPaidSlide, section: "Professional Journey" },
  { id: 20, component: AIMatchingSlide, section: "Unique Features" },
  { id: 21, component: BilingualSlide, section: "Unique Features" },
  { id: 22, component: MobileFirstSlide, section: "Unique Features" },
  { id: 23, component: AnalyticsSlide, section: "Unique Features" },
  { id: 24, component: MarketOpportunitySlide, section: "Market & Growth" },
  { id: 25, component: CompetitiveAdvantagesSlide, section: "Market & Growth" },
  { id: 26, component: TractionSlide, section: "Market & Growth" },
  { id: 27, component: RevenueModelSlide, section: "Market & Growth" },
  { id: 28, component: RoadmapSlide, section: "Future" },
  { id: 29, component: WhyNowSlide, section: "Future" },
  { id: 30, component: CallToActionSlide, section: "Future" },
];

export default function Presentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const totalSlides = slides.length;
  const CurrentSlideComponent = slides[currentSlide].component;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "Escape") {
        navigate("/");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide]);

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage/5 via-background to-copper/5 flex flex-col">
      {/* Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-sage-muted/30 px-6 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <Home className="h-4 w-4" />
          Exit Presentation
        </Button>

        <div className="text-sm text-muted-foreground">
          {slides[currentSlide].section}
        </div>

        <div className="text-sm font-medium">
          {currentSlide + 1} / {totalSlides}
        </div>
      </div>

      {/* Main Slide Area */}
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-7xl">
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <CurrentSlideComponent />
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-t border-sage-muted/30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {/* Progress Dots */}
          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === currentSlide
                    ? "w-8 bg-copper"
                    : "w-2 bg-sage-muted/30 hover:bg-sage-muted/50"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className="gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Keyboard Hints */}
      <div className="fixed bottom-20 right-6 text-xs text-muted-foreground">
        <div>← → Arrow keys to navigate</div>
        <div>ESC to exit</div>
      </div>
    </div>
  );
}
