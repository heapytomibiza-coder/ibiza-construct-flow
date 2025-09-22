import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Clock, 
  Award, 
  Users, 
  CheckCircle, 
  Star,
  MessageCircle,
  Camera
} from 'lucide-react';

interface ServiceBenefitsProps {
  service: any;
}

export const ServiceBenefits = ({ service }: ServiceBenefitsProps) => {
  const benefits = [
    {
      icon: Shield,
      title: 'Background Checked',
      description: 'All professionals are vetted and background checked for your safety'
    },
    {
      icon: Award,
      title: 'Satisfaction Guarantee',
      description: 'If you\'re not satisfied, we\'ll make it right or refund your money'
    },
    {
      icon: Clock,
      title: 'Same Day Available',
      description: 'Get your task completed today with our same-day service options'
    },
    {
      icon: Users,
      title: 'Experienced Professionals',
      description: 'Our network includes thousands of skilled and experienced taskers'
    },
    {
      icon: MessageCircle,
      title: 'Direct Communication',
      description: 'Chat directly with your professional before and during the task'
    },
    {
      icon: Camera,
      title: 'Progress Updates',
      description: 'Receive photo updates and real-time progress reports'
    }
  ];

  const stats = [
    { value: '50K+', label: 'Tasks Completed' },
    { value: '4.8★', label: 'Average Rating' },
    { value: '98%', label: 'On-time Completion' },
    { value: '24/7', label: 'Customer Support' }
  ];

  return (
    <div className="space-y-6">
      {/* Why Choose Us */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Why Choose Our Service</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">{benefit.title}</h4>
                  <p className="text-xs text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Service Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Service Statistics</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* How It Works */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">How It Works</h3>
        
        <div className="space-y-4">
          {[
            'Configure your service requirements above',
            'Review and confirm your booking details',
            'Get matched with qualified professionals',
            'Track progress and communicate directly',
            'Rate your experience when complete'
          ].map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                {index + 1}
              </div>
              <span className="text-sm text-muted-foreground">{step}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Reviews */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Reviews</h3>
        
        <div className="space-y-4">
          {[
            {
              name: 'Sarah M.',
              rating: 5,
              comment: 'Amazing service! The professional was punctual and did an excellent job.',
              date: '2 days ago'
            },
            {
              name: 'Mike R.',
              rating: 5,
              comment: 'Very satisfied with the quality and speed. Will definitely book again.',
              date: '1 week ago'
            }
          ].map((review, index) => (
            <div key={index} className="border-b border-border pb-4 last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{review.name}</span>
                  <div className="flex">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{review.date}</span>
              </div>
              <p className="text-sm text-muted-foreground">{review.comment}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};