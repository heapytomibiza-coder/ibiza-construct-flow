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
      className={`p-3 hover:shadow-md transition-all duration-300 cursor-pointer group h-[110px] flex flex-col justify-between ${gradient ? `bg-gradient-to-br ${gradient} border-border/50` : 'bg-card'}`}
      onClick={() => navigate(path)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-sage/10 rounded-md group-hover:bg-sage/20 transition-colors">
            <Icon className="h-4 w-4 text-sage" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">{title}</h4>
              {badge !== undefined && badge > 0 && (
                <Badge variant="destructive" className="h-4 px-1.5 text-[10px]">
                  {badge}
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{description}</p>
          </div>
        </div>
      </div>
      
      <Button 
        size="sm"
        variant="outline"
        className="w-full h-7 text-[11px] group-hover:bg-sage group-hover:text-white group-hover:border-sage"
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
