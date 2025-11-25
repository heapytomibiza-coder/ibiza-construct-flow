import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { ScreenshotFrame } from "../ScreenshotFrame";

export const PostProjectSlide = () => {
  return (
    <SlideLayout>
      <SlideTitle>Post a Project - Two Ways</SlideTitle>
      <SlideSubtitle>
        Choose your speed: Express checkout for simple jobs, or detailed wizard for
        complex projects
      </SlideSubtitle>

      <div className="space-y-8 mt-12">
        <div className="grid md:grid-cols-2 gap-6">
          <ScreenshotFrame url="constructive-solutions-ibiza.com/post-job">
            <img 
              src="/screenshots/post-job-step1.png" 
              alt="Post Job - Step 1"
              className="w-full h-auto"
            />
          </ScreenshotFrame>
          <ScreenshotFrame url="constructive-solutions-ibiza.com/post-job">
            <img 
              src="/screenshots/post-job-step2.png" 
              alt="Post Job - Step 2"
              className="w-full h-auto"
            />
          </ScreenshotFrame>
        </div>
        <p className="text-center text-muted-foreground">Simple step-by-step wizard to post your project</p>
      </div>
    </SlideLayout>
  );
};
