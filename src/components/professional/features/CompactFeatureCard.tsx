import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CompactFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
  action: string;
  badge?: number;
  gradient?: string;
}

export function CompactFeatureCard({
  icon: Icon,
  title,
  description,
  path,
  action,
  badge,
  gradient
}: CompactFeatureCardProps) {
  const navigate = useNavigate();

  return (
    <Card 
      className={`p-4 hover:shadow-md transition-all duration-300 cursor-pointer group h-[120px] flex flex-col justify-between ${gradient ? `bg-gradient-to-br ${gradient} border-border/50` : 'bg-card'}`}
      onClick={() => navigate(path)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-base">{title}</h4>
              {badge !== undefined && badge > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{description}</p>
          </div>
        </div>
      </div>
      
      <Button 
        size="sm"
        variant="outline"
        className="w-full h-8 text-xs group-hover:bg-primary group-hover:text-primary-foreground"
        onClick={(e) => {
          e.stopPropagation();
          navigate(path);
        }}
      >
        {action}
      </Button>
    </Card>
  );
}
