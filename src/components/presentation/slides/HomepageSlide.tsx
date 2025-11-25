import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { ScreenshotFrame } from "../ScreenshotFrame";

export const HomepageSlide = () => {
  return (
    <SlideLayout background="gradient">
      <SlideTitle>Welcome to Constructive Solutions Ibiza</SlideTitle>
      <SlideSubtitle>Your trusted platform for property services in Ibiza</SlideSubtitle>

      <div className="mt-12">
        <ScreenshotFrame url="constructive-solutions-ibiza.com">
          <img 
            src="/screenshots/homepage-hero.png" 
            alt="Homepage Hero"
            className="w-full h-auto"
          />
        </ScreenshotFrame>
      </div>
    </SlideLayout>
  );
};
