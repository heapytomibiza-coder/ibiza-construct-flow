import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface TaxSettings {
  tax_id?: string;
  vat_number?: string;
  tax_rate: number;
  tax_exempt: boolean;
  business_name?: string;
  business_address?: string;
  invoice_prefix: string;
}

export function TaxSettingsForm() {
  const { toast } = useToast();
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<TaxSettings>({
    tax_rate: 0,
    tax_exempt: false,
    invoice_prefix: 'INV',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile, error } = await supabase
          .from('professional_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (profile) {
          setProfessionalId(profile.user_id);
          setSettings({
            tax_id: (profile as any).tax_id || '',
            vat_number: (profile as any).vat_number || '',
            tax_rate: (profile as any).tax_rate || 0,
            tax_exempt: (profile as any).tax_exempt || false,
            business_name: profile.business_name || '',
            business_address: (profile as any).business_address || '',
            invoice_prefix: (profile as any).invoice_prefix || 'INV',
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load tax settings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!professionalId) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('professional_profiles')
        .update(settings as any)
        .eq('user_id', professionalId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tax settings updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update tax settings",
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
        <CardTitle>Tax Settings</CardTitle>
        <CardDescription>
          Configure your tax information for invoicing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="business_name">Business Name</Label>
            <Input
              id="business_name"
              value={settings.business_name || ''}
              onChange={(e) =>
                setSettings({ ...settings, business_name: e.target.value })
              }
              placeholder="Your Business Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice_prefix">Invoice Prefix</Label>
            <Input
              id="invoice_prefix"
              value={settings.invoice_prefix}
              onChange={(e) =>
                setSettings({ ...settings, invoice_prefix: e.target.value })
              }
              placeholder="INV"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="business_address">Business Address</Label>
          <Textarea
            id="business_address"
            value={settings.business_address || ''}
            onChange={(e) =>
              setSettings({ ...settings, business_address: e.target.value })
            }
            placeholder="Your business address..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tax_id">Tax ID</Label>
            <Input
              id="tax_id"
              value={settings.tax_id || ''}
              onChange={(e) =>
                setSettings({ ...settings, tax_id: e.target.value })
              }
              placeholder="Tax identification number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vat_number">VAT Number</Label>
            <Input
              id="vat_number"
              value={settings.vat_number || ''}
              onChange={(e) =>
                setSettings({ ...settings, vat_number: e.target.value })
              }
              placeholder="VAT registration number"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="tax_exempt">Tax Exempt</Label>
              <p className="text-sm text-muted-foreground">
                Mark if your business is exempt from taxes
              </p>
            </div>
            <Switch
              id="tax_exempt"
              checked={settings.tax_exempt}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, tax_exempt: checked })
              }
            />
          </div>

          {!settings.tax_exempt && (
            <div className="space-y-2">
              <Label htmlFor="tax_rate">Default Tax Rate (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={settings.tax_rate}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    tax_rate: parseFloat(e.target.value) || 0,
                  })
                }
              />
              <p className="text-sm text-muted-foreground">
                This rate will be applied to your invoices by default
              </p>
            </div>
          )}
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Tax Settings'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
