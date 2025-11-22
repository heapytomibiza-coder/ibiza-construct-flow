import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, MessageSquare, FileCheck, Sparkles } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface WorkProcessStep {
  title: string;
  description: string;
  icon?: string;
}

interface WorkProcessTimelineProps {
  steps?: WorkProcessStep[];
}

const defaultSteps: WorkProcessStep[] = [
  {
    title: 'Initial Consultation',
    description: 'We discuss your project needs, timeline, and budget to ensure we\'re the perfect match.'
  },
  {
    title: 'Detailed Quote',
    description: 'You\'ll receive a comprehensive quote with clear pricing and project milestones.'
  },
  {
    title: 'Project Execution',
    description: 'Work begins with regular updates and open communication throughout the process.'
  },
  {
    title: 'Quality Check & Handover',
    description: 'Final inspection, client walkthrough, and complete satisfaction guarantee.'
  }
];

const stepIcons = [MessageSquare, FileCheck, Sparkles, CheckCircle2];

export const WorkProcessTimeline = ({ steps = defaultSteps }: WorkProcessTimelineProps) => {
  const isMobile = useIsMobile();

  return (
    <Card className="card-luxury">
      <CardHeader>
        <CardTitle>How I Work</CardTitle>
        <p className="text-sm text-muted-foreground">
          A transparent, step-by-step process designed for your peace of mind
        </p>
      </CardHeader>
      <CardContent>
        {isMobile ? (
          // Mobile: Compact horizontal cards
          <div className="grid grid-cols-2 gap-3">
            {steps.map((step, index) => {
              const Icon = stepIcons[index % stepIcons.length];
              
              return (
                <div key={index} className="bg-gradient-to-br from-background to-muted/30 p-4 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-primary">Step {index + 1}</span>
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          // Desktop: Vertical timeline with connecting line
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20" />
            
            <div className="space-y-6">
              {steps.map((step, index) => {
                const Icon = stepIcons[index % stepIcons.length];
                const isLast = index === steps.length - 1;
                
                return (
                  <div key={index} className="relative flex gap-4 group">
                    {/* Step Number & Icon */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300 z-10">
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pb-2">
                      <div className={`bg-gradient-to-br from-background to-muted/30 p-4 rounded-lg border-2 border-transparent group-hover:border-primary/20 transition-all duration-300`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-primary">
                            Step {index + 1}
                          </span>
                        </div>
                        <h4 className="font-semibold text-base mb-2">{step.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};