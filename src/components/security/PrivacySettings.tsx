import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { usePrivacyControls } from '@/hooks/usePrivacyControls';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Lock, Eye, Database, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export const PrivacySettings = () => {
  const { privacyControls, isLoading, updatePrivacyControls, giveConsent } = usePrivacyControls();
  const [localControls, setLocalControls] = useState(privacyControls);

  if (isLoading) {
    return <Card className="animate-pulse"><CardContent className="h-96" /></Card>;
  }

  const handleSave = () => {
    if (localControls) {
      updatePrivacyControls(localControls);
      toast.success('Privacy settings updated');
    }
  };

  const handleConsentGiven = () => {
    giveConsent('1.0');
    toast.success('Consent recorded');
  };

  const controls = localControls || {
    data_retention_days: 365,
    allow_analytics: true,
    allow_marketing: false,
    allow_third_party_sharing: false,
    encryption_enabled: true,
    two_factor_enabled: false,
    session_timeout_minutes: 60,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Privacy Settings
        </CardTitle>
        <CardDescription>Control how your data is collected and used</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Collection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Collection
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="analytics">Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Help us improve by allowing analytics data collection
                </p>
              </div>
              <Switch
                id="analytics"
                checked={controls.allow_analytics}
                onCheckedChange={(checked) =>
                  setLocalControls(prev => prev ? { ...prev, allow_analytics: checked } : null)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing">Marketing Communications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about new features and offers
                </p>
              </div>
              <Switch
                id="marketing"
                checked={controls.allow_marketing}
                onCheckedChange={(checked) =>
                  setLocalControls(prev => prev ? { ...prev, allow_marketing: checked } : null)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="third-party">Third-Party Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Allow sharing data with trusted partners
                </p>
              </div>
              <Switch
                id="third-party"
                checked={controls.allow_third_party_sharing}
                onCheckedChange={(checked) =>
                  setLocalControls(prev => prev ? { ...prev, allow_third_party_sharing: checked } : null)
                }
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security Settings
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="encryption">End-to-End Encryption</Label>
                <p className="text-sm text-muted-foreground">
                  Encrypt sensitive data for maximum security
                </p>
              </div>
              <Switch
                id="encryption"
                checked={controls.encryption_enabled}
                onCheckedChange={(checked) =>
                  setLocalControls(prev => prev ? { ...prev, encryption_enabled: checked } : null)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="2fa">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Require a second verification step when signing in
                </p>
              </div>
              <Switch
                id="2fa"
                checked={controls.two_factor_enabled}
                onCheckedChange={(checked) =>
                  setLocalControls(prev => prev ? { ...prev, two_factor_enabled: checked } : null)
                }
              />
            </div>
          </div>
        </div>

        {/* Data Retention */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Data Retention
          </h3>

          <div className="space-y-2">
            <Label htmlFor="retention">Data Retention Period (days)</Label>
            <Input
              id="retention"
              type="number"
              value={controls.data_retention_days}
              onChange={(e) =>
                setLocalControls(prev => prev ? { ...prev, data_retention_days: parseInt(e.target.value) } : null)
              }
              min={30}
              max={3650}
            />
            <p className="text-sm text-muted-foreground">
              How long to keep your data before automatic deletion
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
            <Input
              id="session-timeout"
              type="number"
              value={controls.session_timeout_minutes}
              onChange={(e) =>
                setLocalControls(prev => prev ? { ...prev, session_timeout_minutes: parseInt(e.target.value) } : null)
              }
              min={5}
              max={1440}
            />
            <p className="text-sm text-muted-foreground">
              Automatically log out after this period of inactivity
            </p>
          </div>
        </div>

        {/* Consent */}
        {!privacyControls?.consent_given_at && (
          <div className="p-4 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium mb-2">Privacy Consent Required</p>
                <p className="text-sm text-muted-foreground mb-3">
                  By clicking below, you consent to our data collection and processing practices as described in our Privacy Policy.
                </p>
                <Button onClick={handleConsentGiven} size="sm">
                  Give Consent
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setLocalControls(privacyControls)}>
            Reset
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>

        {/* Consent Status */}
        {privacyControls?.consent_given_at && (
          <div className="text-sm text-muted-foreground text-center pt-4 border-t">
            Consent given on {new Date(privacyControls.consent_given_at).toLocaleDateString()}
            {privacyControls.consent_version && ` (v${privacyControls.consent_version})`}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
