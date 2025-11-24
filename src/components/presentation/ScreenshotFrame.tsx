import { ReactNode } from "react";
import { Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScreenshotFrameProps {
  children: ReactNode;
  url?: string;
  className?: string;
}

export const ScreenshotFrame = ({ children, url, className }: ScreenshotFrameProps) => {
  return (
    <div className={cn("rounded-xl border-2 border-sage-muted/30 shadow-2xl overflow-hidden bg-background", className)}>
      {/* Browser Chrome */}
      <div className="bg-muted/50 px-4 py-3 flex items-center gap-3 border-b border-sage-muted/30">
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-destructive/60" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
          <div className="h-3 w-3 rounded-full bg-sage/60" />
        </div>
        {url && (
          <div className="flex-1 flex items-center gap-2 bg-background/80 rounded px-3 py-1.5 text-xs text-muted-foreground">
            <Monitor className="h-3 w-3" />
            {url}
          </div>
        )}
      </div>
      {/* Content */}
      <div className="bg-card">
        {children}
      </div>
    </div>
  );
};
