import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface StatCounterProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  valueColor?: string;
}

export const StatCounter = ({ 
  value, 
  label, 
  prefix = "", 
  suffix = "", 
  duration = 2000,
  className,
  valueColor = "text-copper"
}: StatCounterProps) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);
  
  return (
    <div className={cn("text-center", className)}>
      <div className={cn("text-5xl font-bold mb-2", valueColor)}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
};
