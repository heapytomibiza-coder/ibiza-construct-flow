import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface FeaturedActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  metric?: string;
  gradient: string;
  path: string;
  action: string;
}

export function FeaturedActionCard({
  icon: Icon,
  title,
  description,
  metric,
  gradient,
  path,
  action
}: FeaturedActionCardProps) {
  const navigate = useNavigate();

  return (
    <Card 
      className={`p-6 bg-gradient-to-br ${gradient} border-border/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group h-[200px] flex flex-col justify-between`}
      onClick={() => navigate(path)}
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-background/50 rounded-lg group-hover:bg-background/70 transition-colors">
            <Icon className="h-8 w-8" />
          </div>
          {metric && (
            <div className="text-right">
              <p className="text-2xl font-bold">{metric}</p>
            </div>
          )}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
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
