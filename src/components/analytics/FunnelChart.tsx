import { Card } from '@/components/ui/card';

interface FunnelStage {
  name: string;
  value: number;
  percentage: number;
}

interface FunnelChartProps {
  data: FunnelStage[];
  title?: string;
}

export function FunnelChart({ data, title }: FunnelChartProps) {
  const maxValue = data[0]?.value || 1;

  return (
    <Card className="p-6">
      {title && <h3 className="text-lg font-semibold mb-6">{title}</h3>}
      <div className="space-y-4">
        {data.map((stage, index) => {
          const width = (stage.value / maxValue) * 100;
          const dropoff = index > 0 ? data[index - 1].value - stage.value : 0;
          const dropoffRate = index > 0 ? ((dropoff / data[index - 1].value) * 100).toFixed(1) : 0;

          return (
            <div key={stage.name} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">{stage.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">
                    {stage.value.toLocaleString()} ({stage.percentage.toFixed(1)}%)
                  </span>
                  {index > 0 && (
                    <span className="text-destructive text-xs">
                      -{dropoffRate}% drop
                    </span>
                  )}
                </div>
              </div>
              <div className="relative h-12 bg-muted rounded-lg overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-medium transition-all duration-500"
                  style={{ width: `${width}%` }}
                >
                  {width > 20 && `${stage.value.toLocaleString()}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
