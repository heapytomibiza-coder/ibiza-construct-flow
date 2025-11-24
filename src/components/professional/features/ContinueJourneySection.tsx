import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, FileText, CheckCircle } from 'lucide-react';

export function ContinueJourneySection() {
  const navigate = useNavigate();

  const journeyActions = [
    {
      icon: Briefcase,
      title: 'Browse Available Jobs',
      description: 'Find new opportunities matching your skills',
      action: 'Browse Jobs',
      path: '/job-board',
      variant: 'primary' as const
    },
    {
      icon: FileText,
      title: 'Submit Quotes',
      description: 'Respond to client requests and grow your business',
      action: 'View Requests',
      path: '/job-board',
      variant: 'secondary' as const
    },
    {
      icon: CheckCircle,
      title: 'Track Your Progress',
      description: 'Monitor active projects and client communications',
      action: 'View Projects',
      path: '/contracts',
      variant: 'tertiary' as const
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Continue Your Journey</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {journeyActions.map((action, index) => (
          <Card key={index} className="card-luxury">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  action.variant === 'primary' ? 'bg-gradient-hero' :
                  action.variant === 'secondary' ? 'bg-copper/10' : 'bg-sage/10'
                }`}>
                  <action.icon className={`w-6 h-6 ${
                    action.variant === 'primary' ? 'text-white' : 'text-copper'
                  }`} />
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{action.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
              <Button 
                onClick={() => navigate(action.path)}
                className={
                  action.variant === 'primary' 
                    ? 'w-full bg-gradient-hero hover:bg-copper text-white' 
                    : 'w-full'
                }
                variant={action.variant === 'primary' ? 'default' : 'outline'}
              >
                {action.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
