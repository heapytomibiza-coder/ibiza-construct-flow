interface ProgressIndicatorProps {
  current: number;
  total: number;
}

export function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Step {current} of {total}</span>
        <span className="text-muted-foreground">{Math.round((current / total) * 100)}%</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-teal-500 to-purple-500 transition-all duration-300"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
