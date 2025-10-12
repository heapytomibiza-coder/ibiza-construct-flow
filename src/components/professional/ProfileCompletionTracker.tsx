import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileCompletionTrackerProps {
  profile: any;
}

export const ProfileCompletionTracker = ({ profile }: ProfileCompletionTrackerProps) => {
  const navigate = useNavigate();
  const [hasServices, setHasServices] = useState<boolean | null>(null);

  useEffect(() => {
    const checkServices = async () => {
      if (!profile?.id) return;
      
      const { data, error } = await supabase
        .from('professional_services')
        .select('id')
        .eq('professional_id', profile.id)
        .eq('is_active', true)
        .limit(1);
      
      setHasServices((data?.length || 0) > 0);
    };

    checkServices();
  }, [profile?.id]);

  const completionItems = useMemo(() => {
    return [
      {
        id: 'services',
        label: 'Configure services you offer',
        completed: hasServices === true,
        required: true,
        loading: hasServices === null
      },
      {
        id: 'bio',
        label: 'Add professional bio',
        completed: !!profile?.bio && profile.bio.length > 20,
        required: true
      },
      {
        id: 'skills',
        label: 'Add skills',
        completed: !!profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0,
        required: true
      },
      {
        id: 'hourly_rate',
        label: 'Set hourly rate',
        completed: !!profile?.hourly_rate && profile.hourly_rate > 0,
        required: true
      },
      {
        id: 'zones',
        label: 'Set service areas',
        completed: !!profile?.zones && Array.isArray(profile.zones) && profile.zones.length > 0,
        required: true
      },
      {
        id: 'availability',
        label: 'Set availability',
        completed: !!profile?.availability && Array.isArray(profile.availability) && profile.availability.length > 0,
        required: true
      },
      {
        id: 'portfolio',
        label: 'Upload portfolio photos (at least 3)',
        completed: !!profile?.portfolio_images && Array.isArray(profile.portfolio_images) && profile.portfolio_images.length >= 3,
        required: false
      }
    ];
  }, [profile, hasServices]);

  const completionPercentage = useMemo(() => {
    const total = completionItems.length;
    const completed = completionItems.filter(item => item.completed).length;
    return Math.round((completed / total) * 100);
  }, [completionItems]);

  const incompleteRequired = completionItems.filter(
    item => item.required && !item.completed
  );

  // Don't show if profile is 100% complete
  if (completionPercentage === 100) {
    return null;
  }

  return (
    <Alert className="border-copper/20 bg-copper/5">
      <AlertCircle className="h-4 w-4 text-copper" />
      <AlertTitle className="flex items-center justify-between">
        <span>Complete Your Profile ({completionPercentage}%)</span>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/settings/professional')}
        >
          Complete Now
        </Button>
      </AlertTitle>
      <AlertDescription className="mt-3 space-y-3">
        <Progress value={completionPercentage} className="h-2" />
        
        <div className="space-y-2">
          {completionItems.map(item => (
            <div key={item.id} className="flex items-center gap-2 text-sm">
              {item.completed ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground" />
              )}
              <span className={item.completed ? 'text-muted-foreground line-through' : ''}>
                {item.label}
                {item.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </div>
          ))}
        </div>

        {incompleteRequired.length > 0 && (
          <p className="text-xs text-muted-foreground pt-2 border-t">
            Complete required items (*) to appear in professional search results
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
};
