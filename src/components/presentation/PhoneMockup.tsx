import { ReactNode } from "react";
import { Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhoneMockupProps {
  children: ReactNode;
  className?: string;
}

export const PhoneMockup = ({ children, className }: PhoneMockupProps) => {
  return (
    <div className={cn("relative mx-auto", className)}>
      {/* Phone Frame */}
      <div className="relative w-72 h-[580px] bg-background rounded-[3rem] border-8 border-sage-muted/30 shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-sage-muted/20 rounded-b-3xl z-10" />
        
        {/* Screen Content */}
        <div className="h-full w-full overflow-hidden bg-card p-4 pt-10">
          {children}
        </div>
        
        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-sage-muted/40 rounded-full" />
      </div>
      
      {/* Device Label */}
      <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
        <Smartphone className="h-4 w-4" />
        Mobile View
      </div>
    </div>
  );
};
