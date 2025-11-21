import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface FeaturedActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  metric?: string;
  path: string;
  action: string;
}

export function FeaturedActionCard({
  icon: Icon,
  title,
  description,
  metric,
  path,
  action
}: FeaturedActionCardProps) {
  const navigate = useNavigate();

  return (
    <Card 
      className="p-5 bg-gradient-to-br from-sage/20 to-sage-dark/10 border-border/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group h-[180px] flex flex-col justify-between"
      onClick={() => navigate(path)}
    >
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="p-2.5 bg-background/50 rounded-lg group-hover:bg-background/70 transition-colors">
            <Icon className="h-7 w-7" />
          </div>
          {metric && (
            <div className="text-right">
              <p className="text-xl font-bold">{metric}</p>
            </div>
          )}
        </div>
        <h3 className="text-base font-semibold mb-1.5">{title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
      </div>
      
      <Button 
        className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
        variant="outline"
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
