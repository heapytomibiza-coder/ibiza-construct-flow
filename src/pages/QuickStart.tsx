import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const IBIZA_AREAS = [
  'Ibiza Town', 'Santa Eulària', 'Sant Josep', 'Sant Antoni', 
  'Platja d\'en Bossa', 'Talamanca', 'Jesus', 'Not sure'
];

const TRADES = [
  { id: 'handyman', name: 'Handyman', description: 'General repairs & maintenance' },
  { id: 'plumber', name: 'Plumber', description: 'Plumbing services' },
  { id: 'electrician', name: 'Electrician', description: 'Electrical work' },
  { id: 'painter', name: 'Painter', description: 'Painting & decorating' },
  { id: 'gardener', name: 'Gardener', description: 'Garden maintenance' },
  { id: 'cleaner', name: 'Cleaner', description: 'Cleaning services' },
];

export default function QuickStart() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);
  const [selectedTrade, setSelectedTrade] = useState('');

  const role = searchParams.get('role') as 'client' | 'professional' || 'client';

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth/sign-in');
          return;
        }

        // Prefill display name from user metadata or email
        const prefillName = user.user_metadata?.full_name || 
                           user.email?.split('@')[0] || '';
        setDisplayName(prefillName);
      } catch (error) {
        console.error('Error initializing user:', error);
      }
    };

    initializeUser();
  }, [navigate]);

  const toggleSelection = (item: string, selectedItems: string[], setSelectedItems: (items: string[]) => void) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          preferred_language: selectedLanguages[0] || 'en',
          roles: role === 'professional' ? ['professional'] : ['client']
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // If professional, create professional profile
      if (role === 'professional' && selectedTrade) {
        const { error: proError } = await supabase
          .from('professional_profiles')
          .insert({
            user_id: user.id,
            primary_trade: selectedTrade,
            zones: selectedAreas,
            languages: selectedLanguages,
            verification_status: 'unverified'
          });

        if (proError) throw proError;
      }

      toast({
        title: 'Profile completed!',
        description: role === 'client' ? 
          'You can now start posting projects.' : 
          'Complete verification to start receiving opportunities.',
      });

      // Navigate to appropriate dashboard
      if (role === 'professional') {
        navigate('/dashboard/pro');
      } else {
        navigate('/dashboard/client');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {role === 'client' ? 'Complete your profile' : 'Set up your professional profile'}
            </CardTitle>
            <p className="text-muted-foreground">
              {role === 'client' ? 
                'Just a few quick details to get you started' : 
                'Tell us about your services - takes less than a minute'
              }
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should we display your name?"
                  required
                />
              </div>

              {/* Languages */}
              <div className="space-y-3">
                <Label>Languages</Label>
                <div className="flex gap-2">
                  {[
                    { code: 'en', name: 'English' },
                    { code: 'es', name: 'Español' }
                  ].map(lang => (
                    <Badge
                      key={lang.code}
                      variant={selectedLanguages.includes(lang.code) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleSelection(lang.code, selectedLanguages, setSelectedLanguages)}
                    >
                      {lang.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Professional-specific fields */}
              {role === 'professional' && (
                <>
                  {/* Primary Trade */}
                  <div className="space-y-3">
                    <Label>Primary Trade</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {TRADES.map(trade => (
                        <Card
                          key={trade.id}
                          className={`cursor-pointer transition-all ${
                            selectedTrade === trade.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => setSelectedTrade(trade.id)}
                        >
                          <CardContent className="p-3">
                            <h4 className="font-medium">{trade.name}</h4>
                            <p className="text-xs text-muted-foreground">{trade.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Service Areas */}
                  <div className="space-y-3">
                    <Label>Service Areas in Ibiza</Label>
                    <div className="flex flex-wrap gap-2">
                      {IBIZA_AREAS.map(area => (
                        <Badge
                          key={area}
                          variant={selectedAreas.includes(area) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => toggleSelection(area, selectedAreas, setSelectedAreas)}
                        >
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Client-specific fields */}
              {role === 'client' && (
                <div className="space-y-3">
                  <Label>Primary Area</Label>
                  <div className="flex flex-wrap gap-2">
                    {IBIZA_AREAS.map(area => (
                      <Badge
                        key={area}
                        variant={selectedAreas.includes(area) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleSelection(area, selectedAreas, setSelectedAreas)}
                      >
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !displayName || (role === 'professional' && !selectedTrade)}
              >
                {loading ? 'Setting up...' : 
                 role === 'client' ? 'Start Finding Professionals' : 'Complete Setup'
                }
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}