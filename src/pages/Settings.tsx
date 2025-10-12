import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeCustomizer } from '@/components/theme/ThemeCustomizer';
import { GdprDataExport } from '@/components/compliance/GdprDataExport';
import { DataDeletionRequest } from '@/components/compliance/DataDeletionRequest';
import { Settings as SettingsIcon, Palette, Shield, Bell } from 'lucide-react';
import { NotificationPreferences } from '@/components/notifications/NotificationPreferences';

export default function Settings() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <SettingsIcon className="w-8 h-8" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your preferences, privacy, and account settings
          </p>
        </div>

        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appearance">
              <Palette className="w-4 h-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="data">
              Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4">
            <ThemeCustomizer />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <NotificationPreferences />
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control your privacy and data sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your privacy is important to us. All data is encrypted and protected according to GDPR standards.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <GdprDataExport />
            <DataDeletionRequest />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
