import { SlideLayout } from "../SlideLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react";

export const CallToActionSlide = () => {
  return (
    <SlideLayout background="gradient" className="flex flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-sage via-copper to-sage bg-clip-text text-transparent">
        Let's Build the Future Together
      </h1>
      
      <p className="text-2xl text-muted-foreground mb-12 max-w-3xl">
        Join us in transforming Ibiza's construction industry
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-12">
        <div className="p-8 rounded-2xl bg-background/80 backdrop-blur border border-sage-muted/30">
          <h3 className="text-2xl font-bold mb-4">For Property Owners</h3>
          <p className="text-muted-foreground mb-6">Post your first project - FREE</p>
          <Button className="w-full bg-copper hover:bg-copper/90 text-white gap-2">
            Get Started <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-8 rounded-2xl bg-background/80 backdrop-blur border border-sage-muted/30">
          <h3 className="text-2xl font-bold mb-4">For Professionals</h3>
          <p className="text-muted-foreground mb-6">Join 500+ verified professionals</p>
          <Button className="w-full bg-sage hover:bg-sage/90 text-white gap-2">
            Join Network <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-background/80 backdrop-blur border border-copper/30">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Mail className="h-5 w-5" />
          <span>Contact: hello@constructivesolutions-ibiza.com</span>
        </div>
      </div>
    </SlideLayout>
  );
};
