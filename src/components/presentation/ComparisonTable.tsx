import { Check, X } from "lucide-react";

interface Feature {
  name: string;
  us: boolean;
  them: boolean;
}

interface ComparisonTableProps {
  features: Feature[];
  usLabel?: string;
  themLabel?: string;
}

export const ComparisonTable = ({ 
  features, 
  usLabel = "Constructive Solutions", 
  themLabel = "Traditional / Generic" 
}: ComparisonTableProps) => {
  return (
    <div className="overflow-hidden rounded-xl border border-sage-muted/30">
      {/* Header */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 border-b border-sage-muted/30">
        <div className="font-bold text-sm">Feature</div>
        <div className="text-center font-bold text-sm text-copper">{usLabel}</div>
        <div className="text-center font-bold text-sm text-muted-foreground">{themLabel}</div>
      </div>
      
      {/* Rows */}
      <div className="bg-card">
        {features.map((feature, index) => (
          <div
            key={index}
            className="grid grid-cols-3 gap-4 p-4 border-b border-sage-muted/20 last:border-0 hover:bg-muted/20 transition-colors"
          >
            <div className="text-sm font-medium">{feature.name}</div>
            <div className="flex justify-center">
              {feature.us ? (
                <div className="h-6 w-6 rounded-full bg-copper/20 flex items-center justify-center">
                  <Check className="h-4 w-4 text-copper" />
                </div>
              ) : (
                <div className="h-6 w-6 rounded-full bg-destructive/20 flex items-center justify-center">
                  <X className="h-4 w-4 text-destructive" />
                </div>
              )}
            </div>
            <div className="flex justify-center">
              {feature.them ? (
                <div className="h-6 w-6 rounded-full bg-sage/20 flex items-center justify-center">
                  <Check className="h-4 w-4 text-sage" />
                </div>
              ) : (
                <div className="h-6 w-6 rounded-full bg-destructive/20 flex items-center justify-center">
                  <X className="h-4 w-4 text-destructive" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
