import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CalculatorCardProps {
  children: ReactNode;
  className?: string;
  selected?: boolean;
  onClick?: () => void;
}

export function CalculatorCard({ children, className, selected, onClick }: CalculatorCardProps) {
  return (
    <div
      className={cn(
        "bg-card border rounded-lg p-6 transition-all duration-200",
        selected && "ring-2 ring-primary shadow-lg shadow-primary/20",
        onClick && "cursor-pointer hover:border-primary/50",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
