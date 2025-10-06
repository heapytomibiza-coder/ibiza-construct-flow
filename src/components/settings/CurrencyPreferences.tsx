import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CurrencySelector } from '@/components/payments/CurrencySelector';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export function CurrencyPreferences() {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [preferredCurrency, setPreferredCurrency] = useState<string>('EUR');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('preferred_currency')
          .eq('id', userId)
          .single();

        if (error) throw error;
        if (data?.preferred_currency) {
          setPreferredCurrency(data.preferred_currency);
        }
      } catch (error: any) {
        console.error('Error fetching currency preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [userId]);

  const handleSave = async () => {
    if (!userId) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_currency: preferredCurrency })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Currency preference updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update currency preference",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Currency Preferences</CardTitle>
        <CardDescription>
          Choose your preferred currency for displaying amounts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CurrencySelector
          value={preferredCurrency}
          onChange={setPreferredCurrency}
          label="Preferred Currency"
        />

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            All payment amounts will be displayed in your preferred currency. Actual charges
            will be processed in the original currency with automatic conversion if needed.
          </p>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
