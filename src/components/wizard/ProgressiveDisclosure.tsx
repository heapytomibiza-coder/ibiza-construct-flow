import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
  isComplete?: boolean;
}

interface ProgressiveDisclosureProps {
  sections: Section[];
  className?: string;
}

export const ProgressiveDisclosure = ({ sections, className }: ProgressiveDisclosureProps) => {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id);

  return (
    <div className={cn("space-y-2", className)}>
      {sections.map((section) => {
        const isActive = section.id === activeSection;
        const isComplete = section.isComplete;

        return (
          <div
            key={section.id}
            className={cn(
              "rounded-xl border-2 transition-all overflow-hidden",
              isActive && "border-primary shadow-md",
              isComplete && !isActive && "border-green-500/30",
              !isActive && !isComplete && "border-border"
            )}
          >
            {/* Header */}
            <button
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "w-full flex items-center justify-between p-4 text-left transition-colors",
                isActive && "bg-primary/5",
                isComplete && !isActive && "bg-green-50/50"
              )}
            >
              <span className={cn(
                "font-medium",
                isActive && "text-primary",
                isComplete && !isActive && "text-green-700"
              )}>
                {section.title}
              </span>
              <ChevronRight className={cn(
                "w-5 h-5 transition-transform",
                isActive && "rotate-90"
              )} />
            </button>

            {/* Content */}
            {isActive && (
              <div className="p-4 border-t animate-in slide-in-from-top-2">
                {section.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
