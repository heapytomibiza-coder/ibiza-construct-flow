import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SlideLayoutProps {
  children: ReactNode;
  className?: string;
  background?: "default" | "gradient" | "copper" | "sage";
}

export const SlideLayout = ({
  children,
  className,
  background = "default",
}: SlideLayoutProps) => {
  return (
    <div
      className={cn(
        "min-h-[70vh] rounded-2xl border border-sage-muted/30 shadow-2xl p-12",
        background === "default" && "bg-card",
        background === "gradient" &&
          "bg-gradient-to-br from-sage/10 via-background to-copper/10",
        background === "copper" && "bg-gradient-to-br from-copper/20 to-copper/5",
        background === "sage" && "bg-gradient-to-br from-sage/20 to-sage/5",
        className
      )}
    >
      {children}
    </div>
  );
};

export const SlideTitle = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <h1
    className={cn(
      "text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-sage to-copper bg-clip-text text-transparent",
      className
    )}
  >
    {children}
  </h1>
);

export const SlideSubtitle = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <p className={cn("text-xl md:text-2xl text-muted-foreground mb-8", className)}>
    {children}
  </p>
);

export const SlideContent = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => <div className={cn("space-y-6", className)}>{children}</div>;
