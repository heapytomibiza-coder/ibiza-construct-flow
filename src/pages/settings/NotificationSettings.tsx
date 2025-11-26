import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/lib/roleHelpers';
import { Loader2 } from 'lucide-react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

export default function NotificationSettings() {
  const { user, profile } = useAuth();
  const { roles } = useRole();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const isProfessional = roles.includes('professional');
  const isClient = roles.includes('client');
  
  const [preferences, setPreferences] = useState({
    // Professional preferences
    email_job_matches: true,
    email_offers: true,
    email_payments: true,
    email_announcements: true,
    email_marketing: false,
    
    // Client preferences
    email_booking_updates: true,
    email_quote_responses: true,
    email_service_recommendations: true,
    email_payment_reminders: true,
    
    email_digest: 'instant',
  });

  useEffect(() => {
    if ((profile as any)?.notification_preferences) {
      setPreferences((profile as any).notification_preferences);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: preferences })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Notification preferences updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard/client' },
          { label: 'Settings', href: '/settings' },
          { label: 'Notifications' }
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Choose what you want to be notified about via email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {isProfessional && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="job-matches">Job Matches</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when new jobs match your profile
                      </p>
                    </div>
                    <Switch
                      id="job-matches"
                      checked={preferences.email_job_matches}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, email_job_matches: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="offers">Offers & Proposals</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about new offers and proposals
                      </p>
                    </div>
                    <Switch
                      id="offers"
                      checked={preferences.email_offers}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, email_offers: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="payments">Payments</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about payment updates
                      </p>
                    </div>
                    <Switch
                      id="payments"
                      checked={preferences.email_payments}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, email_payments: checked })
                      }
                    />
                  </div>
                </>
              )}

              {isClient && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="booking-updates">Booking Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about your booking status changes
                      </p>
                    </div>
                    <Switch
                      id="booking-updates"
                      checked={preferences.email_booking_updates}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, email_booking_updates: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="quote-responses">Quote Responses</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when professionals respond to your requests
                      </p>
                    </div>
                    <Switch
                      id="quote-responses"
                      checked={preferences.email_quote_responses}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, email_quote_responses: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="service-recommendations">Service Recommendations</Label>
                      <p className="text-sm text-muted-foreground">
                        Get suggestions for services you might need
                      </p>
                    </div>
                    <Switch
                      id="service-recommendations"
                      checked={preferences.email_service_recommendations}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, email_service_recommendations: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="payment-reminders">Payment Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Get reminders about upcoming or overdue payments
                      </p>
                    </div>
                    <Switch
                      id="payment-reminders"
                      checked={preferences.email_payment_reminders}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, email_payment_reminders: checked })
                      }
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="announcements">Announcements</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about platform updates and news
                  </p>
                </div>
                <Switch
                  id="announcements"
                  checked={preferences.email_announcements}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, email_announcements: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing">Marketing</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive tips, recommendations, and promotional content
                  </p>
                </div>
                <Switch
                  id="marketing"
                  checked={preferences.email_marketing}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, email_marketing: checked })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="digest">Email Digest</Label>
              <Select
                value={preferences.email_digest}
                onValueChange={(value) =>
                  setPreferences({ ...preferences, email_digest: value })
                }
              >
                <SelectTrigger id="digest">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Instant (as they happen)</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Digest</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose how often you want to receive email notifications
              </p>
            </div>

            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Preferences
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
